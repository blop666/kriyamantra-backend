import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramConnections } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { recordAudit } from "@/lib/audit";
import { requestId, withRequestId } from "@/lib/http";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required", 401);
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (!business) return jsonError("Business profile required", 400);
  const [connection] = await getDb().select({ id: instagramConnections.id, username: instagramConnections.username, accountType: instagramConnections.accountType, status: instagramConnections.status, tokenExpiresAt: instagramConnections.tokenExpiresAt }).from(instagramConnections).where(eq(instagramConnections.businessId, business.id)).limit(1);
  return Response.json({ connection: connection ?? null });
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
