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
  const accounts = parseAccounts(payload);
  let businessId: string | null = null;
  const businessEdges: Record<string, unknown> = {};
  if (!accounts.length) {
    const me = await request(`${graphUrl("me")}?fields=id,client_business_id&access_token=${encodeURIComponent(accessToken)}`);
    businessId = typeof me.client_business_id === "string" ? me.client_business_id : null;
    if (businessId) {
      for (const edge of ["owned_instagram_assets", "client_instagram_assets", "instagram_accounts", "owned_instagram_accounts", "client_instagram_accounts"]) {
        const result = await probe(`${businessId}/${edge}`, accessToken);
        businessEdges[edge] = result.summary;
        const edgeAccounts = result.payload ? parseAccounts(result.payload) : [];
        if (edgeAccounts.length) return edgeAccounts;
      }
    }
  }
  const configured = await resolveConfiguredAccount(accessToken);
  if (configured) return [configured];
  if (!accounts.length) {
    const configuredAccountId = instagramConfig().accountId;
    const configuredAccountCheck = configuredAccountId
      ? await probeNode(configuredAccountId, accessToken)
      : null;
    const diagnostics = await inspectToken(accessToken);
    const summary = {
      responseKeys: Object.keys(payload),
      dataCount: Array.isArray(payload.data) ? payload.data.length : null,
      metaError: payload.error && typeof payload.error === "object" ? {
        code: (payload.error as Record<string, unknown>).code ?? null,
        type: (payload.error as Record<string, unknown>).type ?? null,
        message: (payload.error as Record<string, unknown>).message ?? null,
      } : null,
      businessId,
      businessEdges,
      configuredAccountId,
      configuredAccountCheck,
      token: diagnostics,
    };
    throw new XkiroError(`No Instagram Professional account was shared with KriyaMantra (${JSON.stringify(summary)})`, "invalid_response");
  }
  return accounts;
}

async function resolveConfiguredAccount(accessToken: string) {
  const { accountId } = instagramConfig();
  if (!accountId) return null;
  const payload = await request(`${graphUrl(accountId)}?fields=id,username&access_token=${encodeURIComponent(accessToken)}`).catch(() => null);
  const accounts = payload ? parseAccounts({ data: [payload] }) : [];
  return accounts[0] ?? null;
}

async function probeNode(id: string, accessToken: string) {
  const response = await fetch(`${graphUrl(id)}?fields=id,username,account_type&access_token=${encodeURIComponent(accessToken)}`, { cache: "no-store" });
  const payload = await response.json().catch(() => null) as MetaPayload | null;
  const error = payload?.error && typeof payload.error === "object" ? payload.error as MetaPayload : null;
  return {
    httpStatus: response.status,
    id: typeof payload?.id === "string" ? payload.id : null,
    username: typeof payload?.username === "string" ? payload.username : null,
    accountType: typeof payload?.account_type === "string" ? payload.account_type : null,
    metaError: error ? {
      code: error.code ?? null,
      subcode: error.error_subcode ?? null,
      type: error.type ?? null,
      message: error.message ?? null,
    } : null,
  };
}

async function probe(path: string, accessToken: string) {
  const response = await fetch(`${graphUrl(path)}?fields=id,username&access_token=${encodeURIComponent(accessToken)}`, { cache: "no-store" });
  const payload = await response.json().catch(() => null) as MetaPayload | null;
  const error = payload?.error && typeof payload.error === "object" ? payload.error as MetaPayload : null;
  return {
    payload: response.ok ? payload ?? {} : null,
    summary: {
      httpStatus: response.status,
      responseKeys: Object.keys(payload ?? {}),
      dataCount: Array.isArray(payload?.data) ? payload.data.length : null,
      metaError: error ? {
        code: error.code ?? null,
        type: error.type ?? null,
        message: error.message ?? null,
      } : null,
    },
  };
}

function parseAccounts(payload: MetaPayload) {
  return Array.isArray(payload.data) ? payload.data.filter((item): item is { id: string; username: string } => Boolean(item && typeof item === "object" && typeof (item as Record<string, unknown>).id === "string" && typeof (item as Record<string, unknown>).username === "string")) : [];
}

async function inspectToken(accessToken: string) {
  const [meResult, permissionsResult, debugResult] = await Promise.all([
    request(`${graphUrl("me")}?fields=id,client_business_id&access_token=${encodeURIComponent(accessToken)}`).catch(() => ({})),
    request(`${graphUrl("me/permissions")}?access_token=${encodeURIComponent(accessToken)}`).catch(() => ({})),
    debugToken(accessToken),
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
    debug: debugResult,
  };
}

async function debugToken(accessToken: string) {
  try {
    const { appId, appSecret } = instagramConfig();
    const appAccessToken = `${appId}|${appSecret}`;
    const payload = await request(`${graphUrl("debug_token")}?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appAccessToken)}`);
    const data = payload.data && typeof payload.data === "object" ? payload.data as MetaPayload : {};
    const granularScopes = Array.isArray(data.granular_scopes)
      ? data.granular_scopes.filter((item): item is MetaPayload => Boolean(item && typeof item === "object")).map((item) => ({
        scope: typeof item.scope === "string" ? item.scope : null,
        targetIds: Array.isArray(item.target_ids) ? item.target_ids.filter((id): id is string => typeof id === "string") : [],
      }))
      : [];
    return {
      appId: typeof data.app_id === "string" ? data.app_id : null,
      isValid: data.is_valid === true,
      tokenType: typeof data.type === "string" ? data.type : null,
      scopes: Array.isArray(data.scopes) ? data.scopes.filter((scope): scope is string => typeof scope === "string") : [],
      granularScopes,
    };
  } catch {
    return null;
  }
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
