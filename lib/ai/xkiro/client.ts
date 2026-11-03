import { xkiroConfig } from "./config";
import { XkiroChatRequest, XkiroChatResult, XkiroError } from "./types";

type ProviderResponse = {
  id?: unknown;
  model?: unknown;
  choices?: Array<{ message?: { content?: unknown } }>;
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
};

export async function generateXkiroText(input: XkiroChatRequest): Promise<XkiroChatResult> {
  const config = xkiroConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model || config.model,
        messages: input.messages,
        max_tokens: input.maxOutputTokens || config.maxOutputTokens,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) throw new XkiroError("Xkiro request failed", "provider", response.status);

    const payload = (await response.json()) as ProviderResponse;
    return normalizeResponse(payload);
  } catch (error) {
    if (error instanceof XkiroError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new XkiroError("Xkiro request timed out", "timeout");
    }
    throw new XkiroError("Xkiro request could not be completed", "provider");
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeResponse(payload: ProviderResponse): XkiroChatResult {
  const text = payload.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new XkiroError("Xkiro returned an invalid response", "invalid_response");
  }

  return {
    id: typeof payload.id === "string" ? payload.id : null,
    model: typeof payload.model === "string" ? payload.model : null,
    text: text.trim(),
    usage: {
      inputTokens: numberOrNull(payload.usage?.prompt_tokens),
      outputTokens: numberOrNull(payload.usage?.completion_tokens),
    },
  };
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
