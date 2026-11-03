import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramConnections } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required", 401);
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (!business) return jsonError("Business profile required", 400);
  const [connection] = await getDb().select({ id: instagramConnections.id, username: instagramConnections.username, accountType: instagramConnections.accountType, status: instagramConnections.status, tokenExpiresAt: instagramConnections.tokenExpiresAt }).from(instagramConnections).where(eq(instagramConnections.businessId, business.id)).limit(1);
  return Response.json({ connection: connection ?? null });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required", 401);
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (!business) return jsonError("Business profile required", 400);
  await getDb().delete(instagramConnections).where(eq(instagramConnections.businessId, business.id));
  return Response.json({ disconnected: true });
}
