import { randomBytes } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramOauthStates } from "@/lib/db/schema";
import { hash } from "@/lib/integrations/instagram/crypto";
import { instagramConfig } from "@/lib/integrations/instagram/config";
import { jsonError } from "@/lib/http";
import { randomUUID } from "node:crypto";

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
    const params = new URLSearchParams({ client_id: config.appId, config_id: config.configurationId, redirect_uri: config.redirectUri, response_type: "code", display: "popup", prompt: "login", state });
    return Response.json({ authorizationUrl: `https://www.facebook.com/dialog/oauth?${params}` });
  } catch (error) {
    console.error("Instagram connect initialization failed", error);
    return jsonError("Could not start Instagram connection", 500);
  }
}
