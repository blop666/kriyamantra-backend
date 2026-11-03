import { XkiroError } from "./types";

const DEFAULT_BASE_URL = "https://api.xkiro.com/v1";
const DEFAULT_MODEL = "openai/gpt-5.6-sol";
const DEFAULT_FALLBACK_MODEL = "qwen/qwen3.7-plus:free";
const DEFAULT_VISION_MODEL = "google/gemini-3.6-flash";
const DEFAULT_IMAGE_MODEL = "openai/gpt-image-2.5";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_IMAGE_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 1_200;

export type XkiroConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  fallbackModel: string;
  visionModel: string;
  imageModel: string;
  maxOutputTokens: number;
  timeoutMs: number;
  imageTimeoutMs: number;
};

export function xkiroConfig(): XkiroConfig {
  const apiKey = process.env.XKIRO_API_KEY;
  if (!apiKey) throw new XkiroError("XKIRO_API_KEY is not configured", "configuration");

  return {
    apiKey,
    baseUrl: process.env.AI_BASE_URL?.trim().replace(/\/$/, "") || DEFAULT_BASE_URL,
    model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
    fallbackModel: process.env.AI_FALLBACK_MODEL?.trim() || DEFAULT_FALLBACK_MODEL,
    visionModel: process.env.AI_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL,
    imageModel: process.env.AI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL,
    maxOutputTokens: positiveInteger(process.env.AI_MAX_OUTPUT_TOKENS, DEFAULT_MAX_OUTPUT_TOKENS),
    timeoutMs: positiveInteger(process.env.AI_REQUEST_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    imageTimeoutMs: positiveInteger(process.env.AI_IMAGE_REQUEST_TIMEOUT_MS, DEFAULT_IMAGE_TIMEOUT_MS),
  };
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
