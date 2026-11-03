import { XkiroError } from "@/lib/ai/xkiro/types";

export const instagramScopes = ["instagram_business_basic", "instagram_business_content_publish"] as const;

export function instagramConfig() {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI?.trim();
  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v25.0";
  if (!appId || !appSecret || !redirectUri) throw new XkiroError("Meta Instagram OAuth is not configured", "configuration");
  return { appId, appSecret, redirectUri, version };
}

export function graphUrl(path: string, version = instagramConfig().version) {
  return `https://graph.instagram.com/${version}/${path.replace(/^\//, "")}`;
}
