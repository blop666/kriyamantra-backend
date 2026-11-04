export const MAX_SCHEDULE_RETRIES = 3;

export function safeScheduleError(error: unknown) {
  if (error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "provider_auth") return "Instagram connection requires reconnect";
  return error instanceof Error ? error.message.slice(0, 500) : "Instagram publish failed";
}

export function parseScheduleDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function validMediaType(value: unknown): value is "FEED" | "STORIES" {
  return value === "FEED" || value === "STORIES";
}

export function validCaption(value: unknown) {
  return typeof value === "string" && value.trim().length <= 2200 ? value.trim() : null;
}
