import { and, eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramSchedules } from "@/lib/db/schema";
import { MAX_SCHEDULE_RETRIES } from "@/lib/schedule";
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
    if (schedule.status !== "failed") return withRequestId(jsonError("Only failed posts can be retried", 409, undefined, requestIdValue), requestIdValue);
    if (schedule.attempts >= MAX_SCHEDULE_RETRIES) return withRequestId(jsonError("Retry limit reached", 409, { maxRetries: MAX_SCHEDULE_RETRIES }), requestIdValue);
    const now = new Date();
    const [updated] = await getDb().update(instagramSchedules).set({ status: "scheduled", lastError: null, scheduledFor: now, updatedAt: now }).where(and(eq(instagramSchedules.id, schedule.id), eq(instagramSchedules.status, "failed"), eq(instagramSchedules.attempts, schedule.attempts))).returning();
    if (!updated) return withRequestId(jsonError("Schedule retry state changed; reload and try again", 409, undefined, requestIdValue), requestIdValue);
    await recordAudit({ businessId: business.id, actorUserId: user.id, action: "instagram.schedule.retried", entityType: "instagram_schedule", entityId: schedule.id, requestId: requestIdValue, metadata: { attempts: schedule.attempts } }).catch(() => undefined);
    return withRequestId(Response.json({ data: updated, requestId: requestIdValue }), requestIdValue);
  } catch (error) {
    console.error("Instagram schedule retry failed", error);
    return withRequestId(jsonError("Could not retry Instagram schedule", 500, undefined, requestIdValue), requestIdValue);
  }
}
