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
  if (!accounts.length) {
    const diagnostics = await inspectToken(accessToken);
    const summary = {
      responseKeys: Object.keys(payload),
      dataCount: Array.isArray(payload.data) ? payload.data.length : null,
      metaError: payload.error && typeof payload.error === "object" ? {
        code: (payload.error as Record<string, unknown>).code ?? null,
        type: (payload.error as Record<string, unknown>).type ?? null,
        message: (payload.error as Record<string, unknown>).message ?? null,
      } : null,
      token: diagnostics,
    };
    throw new XkiroError(`No Instagram Professional account was shared with KriyaMantra (${JSON.stringify(summary)})`, "invalid_response");
  }
  return accounts;
}

async function inspectToken(accessToken: string) {
  const [meResult, permissionsResult] = await Promise.all([
    request(`${graphUrl("me")}?fields=id,client_business_id&access_token=${encodeURIComponent(accessToken)}`).catch(() => ({})),
    request(`${graphUrl("me/permissions")}?access_token=${encodeURIComponent(accessToken)}`).catch(() => ({})),
  ]);
  const me = meResult as MetaPayload;
  const permissions = permissionsResult as MetaPayload;
  const granted = Array.isArray(permissions.data)
    ? permissions.data.filter((item): item is { permission: string; status: string } => Boolean(item && typeof item === "object" && typeof (item as Record<string, unknown>).permission === "string" && typeof (item as Record<string, unknown>).status === "string")).map((item) => `${item.permission}:${item.status}`)
    : [];
  return {
    appScopedUserId: typeof me.id === "string" ? me.id : null,
    clientBusinessId: typeof me.client_business_id === "string" ? me.client_business_id : null,
    permissions: granted,
  };
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
