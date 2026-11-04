import { and, eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramSchedules } from "@/lib/db/schema";
import { recordAudit } from "@/lib/audit";
import { jsonError, requestId, withRequestId } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestIdValue = requestId(request);
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return withRequestId(jsonError("Authentication required", 401, undefined, requestIdValue), requestIdValue);
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (!business) return withRequestId(jsonError("Business profile required", 400, undefined, requestIdValue), requestIdValue);
    const [schedule] = await getDb().select().from(instagramSchedules).where(and(eq(instagramSchedules.id, (await params).id), eq(instagramSchedules.businessId, business.id))).limit(1);
    if (!schedule) return withRequestId(jsonError("Schedule not found", 404, undefined, requestIdValue), requestIdValue);
    if (schedule.status !== "scheduled") return withRequestId(jsonError("Only scheduled posts can be cancelled", 409, undefined, requestIdValue), requestIdValue);
    const now = new Date();
    const [updated] = await getDb().update(instagramSchedules).set({ status: "cancelled", cancelledAt: now, updatedAt: now }).where(and(eq(instagramSchedules.id, schedule.id), eq(instagramSchedules.status, "scheduled"))).returning();
    if (!updated) return withRequestId(jsonError("Schedule is no longer cancellable", 409, undefined, requestIdValue), requestIdValue);
    await recordAudit({ businessId: business.id, actorUserId: user.id, action: "instagram.schedule.cancelled", entityType: "instagram_schedule", entityId: schedule.id, requestId: requestIdValue }).catch(() => undefined);
    return withRequestId(Response.json({ data: updated, requestId: requestIdValue }), requestIdValue);
  } catch (error) {
    console.error("Instagram schedule cancellation failed", error);
    return withRequestId(jsonError("Could not cancel Instagram schedule", 500, undefined, requestIdValue), requestIdValue);
  }
}
