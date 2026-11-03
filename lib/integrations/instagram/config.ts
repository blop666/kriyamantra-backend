import { XkiroError } from "@/lib/ai/xkiro/types";

export function instagramConfig() {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI?.trim();
  const configurationId = process.env.INSTAGRAM_CONFIGURATION_ID?.trim();
  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v25.0";
  if (!appId || !appSecret || !redirectUri || !configurationId) throw new XkiroError("Meta Instagram OAuth is not configured", "configuration");
  return { appId, appSecret, redirectUri, configurationId, version };
}

export function graphUrl(path: string, version = instagramConfig().version) {
  return `https://graph.facebook.com/${version}/${path.replace(/^\//, "")}`;
}
