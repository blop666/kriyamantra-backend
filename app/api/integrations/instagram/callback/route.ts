import { and, eq, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramConnections, instagramOauthStates } from "@/lib/db/schema";
import { hash, encrypt } from "@/lib/integrations/instagram/crypto";
import { exchangeCode, profile } from "@/lib/integrations/instagram/api";
import { jsonError } from "@/lib/http";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error");
  if (providerError) return jsonError(`Instagram authorization denied: ${providerError}`, 400);
  if (!code || !state) return jsonError("Instagram callback is missing code or state", 400);
  try {
    const db = getDb();
    const [oauthState] = await db.select().from(instagramOauthStates).where(and(eq(instagramOauthStates.stateHash, hash(state)), isNull(instagramOauthStates.consumedAt))).limit(1);
    if (!oauthState || oauthState.expiresAt < new Date()) return jsonError("Instagram OAuth state expired", 400);
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Authentication required", 401);
    const { data: business } = await supabase.from("businesses").select("id").eq("id", oauthState.businessId).eq("owner_id", user.id).maybeSingle();
    if (!business) return jsonError("Business profile not found", 404);
    await db.update(instagramOauthStates).set({ consumedAt: new Date() }).where(eq(instagramOauthStates.id, oauthState.id));
    const token = await exchangeCode(code);
    const account = await profile(token.accessToken);
    const now = new Date();
    await db.delete(instagramConnections).where(eq(instagramConnections.businessId, oauthState.businessId));
    await db.insert(instagramConnections).values({ id: randomUUID(), businessId: oauthState.businessId, instagramUserId: account.id, username: account.username, accountType: account.accountType, accessTokenEncrypted: encrypt(token.accessToken), tokenExpiresAt: new Date(now.getTime() + token.expiresIn * 1000), scopes: ["instagram_business_basic", "instagram_business_content_publish"], status: "active", connectedAt: now, updatedAt: now });
    return Response.json({ connected: true, username: account.username, instagramUserId: account.id });
  } catch (error) {
    console.error("Instagram callback failed", error);
    return jsonError(error instanceof Error ? error.message : "Could not connect Instagram", 502);
  }
}
