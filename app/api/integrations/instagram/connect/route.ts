import { randomBytes } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramOauthStates } from "@/lib/db/schema";
import { hash } from "@/lib/integrations/instagram/crypto";
import { instagramConfig } from "@/lib/integrations/instagram/config";
import { jsonError } from "@/lib/http";
import { randomUUID } from "node:crypto";
import { XkiroError } from "@/lib/ai/xkiro/types";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Authentication required", 401);
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (!business) return jsonError("Business profile required", 400);
    const config = instagramConfig();
    const state = randomBytes(32).toString("base64url");
    const now = new Date();
    await getDb().insert(instagramOauthStates).values({ id: randomUUID(), businessId: business.id, stateHash: hash(state), expiresAt: new Date(now.getTime() + 10 * 60_000), createdAt: now });
    const params = config.instagramLogin
      ? new URLSearchParams({ client_id: config.appId, redirect_uri: config.redirectUri, response_type: "code", scope: "instagram_business_basic,instagram_business_content_publish", force_reauth: "true", state })
      : new URLSearchParams({ client_id: config.appId, config_id: config.configurationId ?? "", redirect_uri: config.redirectUri, response_type: "code", override_default_response_type: "true", display: "popup", prompt: "login", state });
    return Response.json({ authorizationUrl: `${config.instagramLogin ? "https://www.instagram.com/oauth/authorize" : "https://www.facebook.com/dialog/oauth"}?${params}` });
  } catch (error) {
    console.error("Instagram connect initialization failed", error);
    if (error instanceof XkiroError) return jsonError(error.message, 500, { code: error.code });
    return jsonError("Could not start Instagram connection", 500, { reason: error instanceof Error ? error.message : "Unknown server error" });
  }
}
