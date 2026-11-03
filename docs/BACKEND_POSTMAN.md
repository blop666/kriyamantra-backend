# Backend Setup

## Database

Set `DATABASE_URL` in `.env.local` to the Supabase Postgres pooler connection string. Do not use the direct database URL in serverless deployments.

Commands:

```bash
npm run db:check
npm run db:generate
npm run db:migrate
```

`DATABASE_URL` stays server-only. Never expose it as `NEXT_PUBLIC_*`.

Supabase Auth and RLS remain the request authorization layer. Drizzle owns typed schema and migration history; API requests use the authenticated Supabase server client so policies cannot be bypassed accidentally.

## Postman

1. `POST /api/auth/signup` with `{ "email": "...", "password": "..." }`.
2. `POST /api/auth/signin` with the same payload.
3. Use the same browser session for cookie-authenticated requests, or add the Supabase auth cookies to Postman.
4. `POST /api/onboarding` to create the business profile.
5. `POST /api/products` with:

```json
{
  "name": "Selendang Endek Bali",
  "description": "Tenun handmade...",
  "materials": "Benang katun",
  "price": 350000
}
```

6. `GET /api/products`.
7. `POST /api/products/:id/image` as `multipart/form-data`, field `file`, JPEG/PNG/WebP, max 5 MB.
8. `PATCH /api/products/:id` or `DELETE /api/products/:id`.
9. `POST /api/chat` until the conversation state becomes `confirm_generation`.
10. `POST /api/content-generations` only after explicit confirmation:

```json
{
  "conversationId": "CONVERSATION_UUID",
  "productId": "PRODUCT_UUID",
  "format": "feed",
  "angle": "fokus tekstur",
  "confirmed": true
}
```

11. `GET /api/content-generations` to inspect saved draft generations.

`/api/content-generations` generates copy and a creative brief only. Image generation is a later stage.

12. `POST /api/content-generations/:id/image` starts image generation.
13. Poll `GET /api/content-generations/:id/image` until `imageStatus` is `succeeded` or `failed`.

Image assets are stored in the private `generated-images` bucket. Successful responses include a temporary signed URL.
