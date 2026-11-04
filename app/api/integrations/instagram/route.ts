import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramConnections } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { recordAudit } from "@/lib/audit";
import { requestId, withRequestId } from "@/lib/http";

export async function GET(request: Request) {
  const id = requestId(request);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withRequestId(jsonError("Authentication required", 401, undefined, id), id);
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (!business) return withRequestId(jsonError("Business profile required", 400, undefined, id), id);
  const [connection] = await getDb().select({ id: instagramConnections.id, username: instagramConnections.username, accountType: instagramConnections.accountType, status: instagramConnections.status, tokenExpiresAt: instagramConnections.tokenExpiresAt }).from(instagramConnections).where(eq(instagramConnections.businessId, business.id)).limit(1);
  if (!connection) return withRequestId(Response.json({ connection: null }), id);
  const expired = connection.tokenExpiresAt ? connection.tokenExpiresAt <= new Date() : false;
  if (expired && connection.status === "active") {
    await getDb().update(instagramConnections).set({ status: "expired", updatedAt: new Date() }).where(eq(instagramConnections.id, connection.id));
    connection.status = "expired";
  }
  return withRequestId(Response.json({ connection: { ...connection, reconnectRequired: connection.status !== "active" } }), id);
}

export async function DELETE(request: Request) {
  const id = requestId(request);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return withRequestId(jsonError("Authentication required", 401, undefined, id), id);
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (!business) return withRequestId(jsonError("Business profile required", 400, undefined, id), id);
  await getDb().delete(instagramConnections).where(eq(instagramConnections.businessId, business.id));
  await recordAudit({ businessId: business.id, actorUserId: user.id, action: "instagram.disconnected", entityType: "instagram_connection", requestId: id }).catch(() => undefined);
  return withRequestId(Response.json({ disconnected: true }), id);
}
