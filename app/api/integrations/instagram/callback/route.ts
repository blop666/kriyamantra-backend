import { and, eq, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramConnections, instagramOauthStates } from "@/lib/db/schema";
import { hash, encrypt } from "@/lib/integrations/instagram/crypto";
import { assignedAccounts, exchangeCode, instagramLoginAccount } from "@/lib/integrations/instagram/api";
import { instagramConfig } from "@/lib/integrations/instagram/config";
import { jsonError } from "@/lib/http";
import { recordAudit } from "@/lib/audit";
import { requestId, withRequestId } from "@/lib/http";

export async function GET(request: Request) {
  const id = requestId(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error");
  if (providerError) return withRequestId(jsonError("Instagram authorization denied", 400, undefined, id), id);
  if (!code || !state) return withRequestId(jsonError("Instagram callback is missing code or state", 400, undefined, id), id);
  try {
    const db = getDb();
    const [oauthState] = await db.select().from(instagramOauthStates).where(and(eq(instagramOauthStates.stateHash, hash(state)), isNull(instagramOauthStates.consumedAt))).limit(1);
    if (!oauthState || oauthState.expiresAt < new Date()) return withRequestId(jsonError("Instagram OAuth state expired", 400, undefined, id), id);
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return withRequestId(jsonError("Authentication required", 401, undefined, id), id);
    const { data: business } = await supabase.from("businesses").select("id").eq("id", oauthState.businessId).eq("owner_id", user.id).maybeSingle();
    if (!business) return withRequestId(jsonError("Business profile not found", 404, undefined, id), id);
    await db.update(instagramOauthStates).set({ consumedAt: new Date() }).where(eq(instagramOauthStates.id, oauthState.id));
    const token = await exchangeCode(code);
    const config = instagramConfig();
    const account = config.instagramLogin ? await instagramLoginAccount(token.accessToken) : (await assignedAccounts(token.accessToken))[0];
    if (!account) return jsonError("Instagram account was not returned by Meta", 502);
    const accountType = config.instagramLogin ? (account as unknown as { accountType: string }).accountType : "professional";
    const scopes = config.instagramLogin ? (token as { scopes: string[] }).scopes : ["instagram_basic", "instagram_content_publish"];
    const now = new Date();
    await db.delete(instagramConnections).where(eq(instagramConnections.businessId, oauthState.businessId));
    await db.insert(instagramConnections).values({ id: randomUUID(), businessId: oauthState.businessId, instagramUserId: account.id, username: account.username, accountType, accessTokenEncrypted: encrypt(token.accessToken), tokenExpiresAt: new Date(now.getTime() + token.expiresIn * 1000), scopes, status: "active", connectedAt: now, updatedAt: now });
    await recordAudit({ businessId: business.id, actorUserId: user.id, action: "instagram.connected", entityType: "instagram_connection", entityId: account.id, requestId: id, metadata: { username: account.username } }).catch(() => undefined);
    return withRequestId(Response.json({ connected: true, username: account.username, instagramUserId: account.id }), id);
  } catch (error) {
    console.error("Instagram callback failed", error);
    return withRequestId(jsonError("Could not connect Instagram", 502, undefined, id), id);
  }
}
