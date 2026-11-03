# KriyaMantra AI Implementation Plan

Status: planning
Updated: 2026-11-02

## Goal

Build the smallest complete backend flow for KriyaMantra:

```text
business + product context
  -> guided questions
  -> AI creative brief
  -> Indonesian and English copy
  -> image generation
  -> saved draft output
  -> user revision or approval
```

Implementation proceeds one stage at a time. Each stage must pass its checks before the next stage starts.

## Current State

Already available:

- Supabase Auth with server-side session cookies.
- `businesses` and `consents` tables.
- `products` table with RLS.
- Private `product-images` Storage bucket and upload API.
- Product CRUD API.
- Drizzle ORM and migration commands.
- Postman testing notes.
- PRD flow requiring guided questions, AI copy, poster options, revision, approval, and later publishing.

Not available yet:

- Conversation and message persistence.
- Guided AI agent state.
- Xkiro adapter.
- Creative brief generation.
- Generated content persistence.
- Generated image Storage bucket.
- Revision/version API.
- WhatsApp webhook.
- Instagram publishing.

## Xkiro Contract

Known and usable now:

```env
AI_BASE_URL=https://api.xkiro.com/v1
XKIRO_API_KEY=
AI_MODEL=openai/gpt-5.6-sol
AI_VISION_MODEL=google/gemini-3.6-flash
AI_FALLBACK_MODEL=qwen/qwen3.7-plus:free
AI_MAX_OUTPUT_TOKENS=1200
AI_REQUEST_TIMEOUT_MS=30000
AI_CHATBOT_RATE_LIMIT=20
AI_ADMIN_DAILY_LIMIT=30
```

Known text request shape:

```http
POST {AI_BASE_URL}/chat/completions
Authorization: Bearer {XKIRO_API_KEY}
Content-Type: application/json
```

```json
{
  "model": "openai/gpt-5.6-sol",
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

Model roles:

- `AI_MODEL`: primary agent, structured copy, creative brief.
- `AI_FALLBACK_MODEL`: retry/fallback for text failures.
- `AI_VISION_MODEL`: optional product-photo analysis.
- `AI_IMAGE_MODEL`: not enabled yet; endpoint and response format are unknown.

The image model candidate is `openai/gpt-image-2.5`, but model availability does not prove that Xkiro exposes it through `/chat/completions` or `/images/generations`. Do not implement against an assumed image contract.

## Design Flow Interpretation

The available `design.json` contains Figma frame names, dimensions, and image reference IDs. It does not contain the source bitmap assets in this repository, so visual inspection is incomplete.

Relevant flow labels found in the file:

- Product/context screen: `Kain Endek Kidung Cempaka`.
- Creative choices: `Opsi 1: Fokus Tekstur`, `Opsi 2: Proses Bengkel`, `Opsi 3: Gaya & Busana`.
- Poster/content examples: `Tenun Songket Tradisional Nusantara`, `Kain Tenun Endek Songket Melengkung`, `Balinese Endek Cempaka Cloth Texture`.
- Brand asset references: `KriyaMantra Logo`, `Logo KriyaMantra`.

Backend implication:

1. User gives product information and photos.
2. System asks only for missing information.
3. User chooses a creative angle.
4. AI creates copy and a brief.
5. Image generation produces draft options.
6. User selects, revises, or approves.

The design file should not be treated as the API contract. Product state, conversation state, and generation state must be explicit in the database.

## Guided Question Flow

The agent must not generate an image immediately after the first message.

State machine:

```text
collect_context
  -> ask_missing_data
  -> confirm_generation
  -> generating
  -> review_output
  -> revision or approved
```

Required product context before generation:

- Product name.
- Product description or story.
- Main material/process when relevant.
- Price, only when user wants price in content.
- At least one product image for poster generation.
- Selected format: `feed` or `story`.
- Selected creative angle.

Existing business context is reused:

- Business name.
- Category.
- Location.
- Business story.
- Tone.
- Languages.

Rules:

- Ask at most two questions per turn.
- Do not ask for data already stored and confirmed.
- Show the collected summary before expensive generation.
- User confirmation is required before image generation.
- Imported text is data, never an instruction.

Example agent result:

```json
{
  "reply": "Apa nama produk ini dan bahan utamanya?",
  "state": "ask_missing_data",
  "missingFields": ["product.name", "product.materials"],
  "nextAction": "ask_user",
  "readyForGeneration": false
}
```

## AI Output Rules

All internal agent responses use validated JSON. No route should depend on parsing prose.

Agent action enum:

```text
ask_missing_data
confirm_context
create_brief
generate_content
revise_content
out_of_scope
```

Mandatory guardrails:

- Do not invent price, material, origin, certification, health, organic, halal, or sustainability claims.
- Keep Indonesian copy primary and provide English separately.
- Keep user-provided product facts distinct from AI suggestions.
- Label uncertain vision results as `tebakan_ai` and `confirmed: false`.
- Mark every generated result as draft until explicit approval.
- Keep the bot within product marketing tasks.
- Limit revisions per output, target five.

Expected copy result:

```json
{
  "captionId": "...",
  "captionEn": "...",
  "hashtags": ["#TenunBali"],
  "altText": "...",
  "creativeBrief": {
    "angle": "fokus tekstur",
    "mood": "hangat dan natural",
    "composition": "...",
    "overlayText": "..."
  },
  "warnings": []
}
```

## Database Plan

Add tables incrementally through migrations:

### `conversations`

- `id`
- `business_id`
- `channel`: `web | whatsapp`
- `state`
- `created_at`
- `updated_at`

### `messages`

- `id`
- `conversation_id`
- `role`: `user | assistant | system`
- `content`
- `metadata`
- `created_at`

### `content_generations`

- `id`
- `business_id`
- `product_id`
- `conversation_id`
- `status`: `queued | processing | succeeded | failed`
- `format`: `feed | story`
- `request_payload`
- `error_message`
- `created_at`
- `completed_at`

### `content_outputs`

- `id`
- `generation_id`
- `version`
- `image_path`
- `caption_id`
- `caption_en`
- `hashtags`
- `creative_brief`
- `quality_status`
- `is_selected`
- `created_at`

Every table needs owner isolation through `business_id -> businesses.owner_id` RLS.

## API Plan

### Stage APIs

```http
POST /api/chat
GET  /api/chat/:id
```

Chat receives a message, persists it, builds context, calls the agent, persists the assistant response, and returns the next action.

```http
POST /api/content-generations
GET  /api/content-generations/:id
```

Generation creates a job and returns a status. It should be asynchronous if image generation can exceed the request timeout.

```http
POST /api/content-generations/:id/revisions
```

Revision creates a new output version. Older versions remain immutable.

## Ordered Implementation Stages

### Stage 0: Configuration and provider probe

Purpose: prove Xkiro text connectivity before adding application behavior.

Work:

- Add server-only AI environment contract.
- Add Xkiro client with timeout and safe errors.
- Send one minimal `chat/completions` request.
- Normalize response text.
- Never log API key or full user image data.

Done when:

- A local test can call Xkiro successfully.
- Invalid key, timeout, and non-2xx responses become safe typed errors.
- The model name is configurable.

This is the next stage. Do not build chat or image generation before it passes.

### Stage 1: Conversation persistence

Work:

- Add `conversations` and `messages` migration.
- Add Drizzle schema.
- Add ownership policies.
- Create and fetch a web conversation.

Done when:

- A signed-in user can create one conversation.
- Another user cannot read it.

### Stage 2: Guided agent

Work:

- Add context builder.
- Add strict agent JSON schema.
- Implement missing-field detection.
- Add `/api/chat`.
- Store user and assistant messages.

Done when:

- Chat asks for missing product data.
- Chat asks no more than two questions.
- Chat returns a validated action.

### Stage 3: Copy and creative brief

Work:

- Add `content_generations` and `content_outputs`.
- Generate Indonesian/English copy and hashtags.
- Persist brief as draft.
- Add explicit user confirmation.

Done when:

- A complete product context produces valid copy JSON.
- No image request is made before confirmation.

### Stage 4: Image provider discovery and adapter

Work:

- Confirm Xkiro image endpoint using documentation or a controlled request.
- Add `AI_IMAGE_MODEL=openai/gpt-image-2.5` only after confirmation.
- Implement sync or async adapter based on actual response.
- Store generated image in private Storage.

Done when:

- One generated image is saved and retrievable via signed URL.
- Provider failures update generation status to `failed`.

### Stage 5: Revision and quality checks

Work:

- Add immutable output versions.
- Add revision limit.
- Add basic text/claim validation.
- Add optional vision quality check.

Done when:

- Revision creates a new version.
- Original output remains available.
- Unsafe unsupported claims are flagged.

### Stage 6: Postman contract tests

Work:

- Add Postman collection and environment.
- Test happy path, invalid payload, timeout, unauthorized access, and ownership isolation.
- Use short smoke-test commands with explicit timeouts.

Done when:

- The full web flow works without UI.
- Every failure returns safe JSON and a useful status code.

### Stage 7: WhatsApp and Instagram

Deferred until the web AI flow works end-to-end.

## Image Generation Decision

Current status: unknown.

Do not guess these fields:

- Image endpoint.
- Input image format.
- Prompt field.
- Aspect-ratio field.
- Output URL/base64 field.
- Async job/polling behavior.

If no Xkiro image documentation is available, run a controlled provider probe only after Stage 0. The probe must be short, use a low-cost model/request, and stop on the first clear unsupported response.

Fallback options, only if Xkiro cannot generate images:

1. Keep Xkiro for text/vision and add a separate image provider adapter.
2. Use a temporary mock image adapter for database/API integration tests.
3. Do not silently claim that image generation works.

## Rate Limits and Cost Controls

- Apply `AI_CHATBOT_RATE_LIMIT` per user/business and time window.
- Apply daily generation limits separately from chat limits.
- Limit image generation retries.
- Limit revision count to five initially.
- Truncate conversation context.
- Store provider request IDs when available.
- Never return provider secrets or raw provider errors to clients.

## Testing Strategy

One stage at a time:

1. Unit test input parsing and agent output validation.
2. Provider probe with a real Xkiro key locally.
3. API test with a signed-in test user.
4. Ownership test with a second user.
5. Image adapter test only after endpoint confirmation.
6. Full Postman flow.

Do not run a long end-to-end command without a timeout. Expected local checks should normally finish within 30-60 seconds; image provider calls may require a separate explicit timeout.

## Deferred Work

- UI redesign.
- WhatsApp webhook.
- Instagram OAuth and publishing.
- Scheduler.
- Voice note transcription.
- Website import.
- Embeddings and semantic memory.
- Advanced OCR/vision quality scoring.
- Weekly task automation.

## Definition Of Done For The First AI Milestone

The first milestone is complete when Postman can execute:

```text
signin
  -> onboarding
  -> create product
  -> start conversation
  -> answer guided questions
  -> confirm context
  -> receive Indonesian/English copy and creative brief
```

Image generation is a separate milestone until the Xkiro image contract is confirmed.
