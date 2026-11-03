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
  const body = new URLSearchParams({ client_id: config.appId, client_secret: config.appSecret, grant_type: "authorization_code", redirect_uri: config.redirectUri, code });
  const short = await request("https://api.instagram.com/oauth/access_token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const long = await request(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(config.appSecret)}&access_token=${encodeURIComponent(String(short.access_token))}`);
  return { accessToken: String(long.access_token), expiresIn: Number(long.expires_in) || 5_184_000, userId: String(short.user_id ?? long.user_id) };
}

export async function profile(accessToken: string) {
  const payload = await request(`${graphUrl("me")}?fields=user_id,username,name&access_token=${encodeURIComponent(accessToken)}`);
  if (typeof payload.user_id !== "string" || typeof payload.username !== "string") throw new XkiroError("Instagram account profile is incomplete", "invalid_response");
  return { id: payload.user_id, username: payload.username, accountType: "professional" };
}

export async function refresh(accessToken: string) {
  const payload = await request(`${graphUrl("refresh_access_token")}?grant_type=ig_refresh_token&access_token=${encodeURIComponent(accessToken)}`);
  return { accessToken: String(payload.access_token), expiresIn: Number(payload.expires_in) || 5_184_000 };
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
