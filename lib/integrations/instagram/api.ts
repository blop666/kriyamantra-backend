import { graphUrl, instagramConfig } from "./config";
import { XkiroError } from "@/lib/ai/xkiro/types";

type MetaPayload = Record<string, unknown>;

async function request(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload = await response.json().catch(() => null) as MetaPayload | null;
  if (!response.ok) {
    const error = payload?.error as MetaPayload | undefined;
    throw new XkiroError(typeof error?.message === "string" ? `Instagram: ${error.message}` : "Instagram API request failed", "provider", response.status);
  }
  return payload ?? {};
}

export async function exchangeCode(code: string) {
  const config = instagramConfig();
  const params = new URLSearchParams({ client_id: config.appId, client_secret: config.appSecret, code, redirect_uri: config.redirectUri });
  const payload = await request(`${graphUrl("oauth/access_token")}?${params}`);
  if (typeof payload.access_token !== "string") throw new XkiroError("Meta did not return an access token", "invalid_response");
  return { accessToken: payload.access_token, expiresIn: Number(payload.expires_in) || 5_184_000 };
}

export async function assignedAccounts(accessToken: string) {
  const payload = await request(`${graphUrl("me/assigned_instagram_accounts")}?fields=id,username&access_token=${encodeURIComponent(accessToken)}`);
  const accounts = Array.isArray(payload.data) ? payload.data.filter((item): item is { id: string; username: string } => Boolean(item && typeof item === "object" && typeof (item as Record<string, unknown>).id === "string" && typeof (item as Record<string, unknown>).username === "string")) : [];
  if (!accounts.length) throw new XkiroError("No Instagram Professional account was shared with KriyaMantra", "invalid_response");
  return accounts;
}

export async function createContainer(input: { userId: string; accessToken: string; imageUrl: string; caption: string; mediaType: "FEED" | "STORIES" }) {
  const body = new URLSearchParams({ image_url: input.imageUrl, access_token: input.accessToken, is_ai_generated: "true" });
  if (input.mediaType === "STORIES") body.set("media_type", "STORIES"); else body.set("caption", input.caption);
  const payload = await request(graphUrl(`${input.userId}/media`), { method: "POST", body });
  if (typeof payload.id !== "string") throw new XkiroError("Instagram did not return a media container", "invalid_response");
  return payload.id;
}

export async function publishContainer(userId: string, accessToken: string, containerId: string) {
  const payload = await request(graphUrl(`${userId}/media_publish`), { method: "POST", body: new URLSearchParams({ creation_id: containerId, access_token: accessToken }) });
  if (typeof payload.id !== "string") throw new XkiroError("Instagram did not return a published media ID", "invalid_response");
  return payload.id;
}
