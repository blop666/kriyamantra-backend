import { XkiroError } from "@/lib/ai/xkiro/types";

export function instagramConfig() {
  const instagramLogin = process.env.INSTAGRAM_LOGIN_MODE?.trim().toLowerCase() === "true";
  const appId = (instagramLogin ? process.env.INSTAGRAM_APP_ID : process.env.META_APP_ID)?.trim();
  const appSecret = (instagramLogin ? process.env.INSTAGRAM_APP_SECRET : process.env.META_APP_SECRET)?.trim();
  const redirectUri = (instagramLogin ? process.env.INSTAGRAM_LOGIN_REDIRECT_URI : process.env.INSTAGRAM_REDIRECT_URI)?.trim();
  const configurationId = process.env.INSTAGRAM_CONFIGURATION_ID?.trim();
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID?.trim() || null;
  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v26.0";
  if (!appId || !appSecret || !redirectUri || (!instagramLogin && !configurationId)) {
    const missing = [!appId && (instagramLogin ? "INSTAGRAM_APP_ID" : "META_APP_ID"), !appSecret && (instagramLogin ? "INSTAGRAM_APP_SECRET" : "META_APP_SECRET"), !redirectUri && (instagramLogin ? "INSTAGRAM_LOGIN_REDIRECT_URI" : "INSTAGRAM_REDIRECT_URI"), !instagramLogin && !configurationId && "INSTAGRAM_CONFIGURATION_ID"].filter(Boolean);
    throw new XkiroError(`Meta Instagram OAuth is not configured; missing: ${missing.join(", ")}`, "configuration");
  }
  return { appId, appSecret, redirectUri, configurationId, accountId, version, instagramLogin };
}

export function graphUrl(path: string, version = instagramConfig().version) {
  const host = instagramConfig().instagramLogin ? "graph.instagram.com" : "graph.facebook.com";
  return `https://${host}/${version}/${path.replace(/^\//, "")}`;
}
