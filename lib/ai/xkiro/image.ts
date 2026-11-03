import { xkiroConfig } from "./config";
import { XkiroError } from "./types";

type ImagePayload = Record<string, unknown>;

export type XkiroImageJob = {
  id: string;
  status: "queued" | "processing" | "succeeded" | "failed";
  url: string | null;
  base64: string | null;
  error: string | null;
};

export async function createXkiroImage(prompt: string, format: "feed" | "story", referenceImage?: Blob) {
  const config = xkiroConfig();
  const payload = await request(referenceImage ? "/images/edits" : "/images/generations", referenceImage ? undefined : {
    model: config.imageModel,
    prompt,
    size: format === "story" ? "1024x1536" : "1536x1024",
  }, referenceImage ? { model: config.imageModel, prompt, size: format === "story" ? "1024x1536" : "1536x1024", image: referenceImage } : undefined);
  return normalizeJob(payload, "processing");
}

export async function pollXkiroImage(id: string) {
  const payload = await request(`/images/generations/${encodeURIComponent(id)}`);
  return normalizeJob(payload, "processing", id);
}

async function request(path: string, body?: Record<string, unknown>, edit?: { model: string; prompt: string; size: string; image: Blob }) {
  const config = xkiroConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.imageTimeoutMs);
  try {
    const form = edit ? new FormData() : null;
    if (form && edit) {
      form.append("model", edit.model);
      form.append("prompt", edit.prompt);
      form.append("size", edit.size);
      form.append("image", edit.image, "product-reference");
    }
    const response = await fetch(`${config.baseUrl}${path}`, {
      method: body || edit ? "POST" : "GET",
      headers: { Authorization: `Bearer ${config.apiKey}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(form ? { body: form } : body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      const providerError = await response.json().catch(() => null) as { error?: { message?: unknown } } | null;
      const message = providerError?.error?.message;
      throw new XkiroError(typeof message === "string" ? `Xkiro image request failed: ${message}` : `Xkiro image request failed (${response.status})`, "provider", response.status);
    }
    return (await response.json()) as ImagePayload;
  } catch (error) {
    if (error instanceof XkiroError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new XkiroError("Xkiro image request timed out", "timeout");
    throw new XkiroError("Xkiro image request could not be completed", "provider");
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeJob(payload: ImagePayload, fallbackStatus: XkiroImageJob["status"], fallbackId?: string): XkiroImageJob {
  const data = Array.isArray(payload.data) ? payload.data[0] as ImagePayload | undefined : undefined;
  const source = data ?? payload;
  const id = stringValue(payload.id) ?? stringValue(source.id) ?? fallbackId;
  const url = stringValue(source.url) ?? stringValue(source.result_url) ?? stringValue(payload.url);
  const base64 = stringValue(source.b64_json) ?? stringValue(source.base64) ?? stringValue(payload.b64_json);
  const rawStatus = stringValue(payload.status) ?? stringValue(source.status);
  const providerError = payload.error && typeof payload.error === "object" ? payload.error as ImagePayload : source.error && typeof source.error === "object" ? source.error as ImagePayload : null;
  const status = rawStatus === "completed" || rawStatus === "succeeded" ? "succeeded" : rawStatus === "failed" || rawStatus === "error" ? "failed" : fallbackStatus;
  if (!id) throw new XkiroError("Xkiro returned an invalid image job", "invalid_response");
  return { id, status, url, base64, error: stringValue(providerError?.message) };
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}
