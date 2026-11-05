import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs, instagramConnections, instagramPublishJobs, instagramSchedules } from "@/lib/db/schema";
import { recordAudit } from "@/lib/audit";
import { jsonError, readJson, requestId, withRequestId } from "@/lib/http";
import { parseScheduleDate, validCaption, validMediaType } from "@/lib/schedule";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return mutateSchedule(request, await params, false);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return mutateSchedule(request, await params, true);
}

async function mutateSchedule(request: Request, params: { id: string }, update: boolean) {
  const requestIdValue = requestId(request);
  try {
    const input = await readJson(request);
    if (!input || typeof input !== "object") return withRequestId(jsonError("Invalid schedule payload", 400, undefined, requestIdValue), requestIdValue);
    const body = input as Record<string, unknown>;
    const scheduledFor = parseScheduleDate(body.scheduledFor);
    const mediaType = body.mediaType;
    const caption = body.caption === undefined ? null : validCaption(body.caption);
    if (!scheduledFor || scheduledFor <= new Date()) return withRequestId(jsonError("scheduledFor must be a future ISO timestamp", 400, undefined, requestIdValue), requestIdValue);
    if (!update && !validMediaType(mediaType)) return withRequestId(jsonError("mediaType must be FEED or STORIES", 400, undefined, requestIdValue), requestIdValue);
    if (body.caption !== undefined && caption === null) return withRequestId(jsonError("caption must be a string up to 2200 characters", 400, undefined, requestIdValue), requestIdValue);
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return withRequestId(jsonError("Authentication required", 401, undefined, requestIdValue), requestIdValue);
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (!business) return withRequestId(jsonError("Business profile required", 400, undefined, requestIdValue), requestIdValue);
    const db = getDb();
    let updateSchedule;
    let generationId = params.id;
    if (update) {
      [updateSchedule] = await db.select().from(instagramSchedules).where(and(eq(instagramSchedules.id, params.id), eq(instagramSchedules.businessId, business.id))).limit(1);
      if (!updateSchedule) return withRequestId(jsonError("Schedule not found", 404, undefined, requestIdValue), requestIdValue);
      generationId = updateSchedule.generationId;
    }
    const [generation] = await db.select({ id: contentGenerations.id, status: contentGenerations.status, imageStatus: contentGenerations.imageStatus }).from(contentGenerations).where(and(eq(contentGenerations.id, generationId), eq(contentGenerations.businessId, business.id))).limit(1);
    if (!generation) return withRequestId(jsonError("Post not found", 404, undefined, requestIdValue), requestIdValue);
    if (generation.status !== "succeeded" || generation.imageStatus !== "succeeded") return withRequestId(jsonError("Post image is not ready", 409, undefined, requestIdValue), requestIdValue);
    const [output] = await db.select({ imagePath: contentOutputs.imagePath, captionId: contentOutputs.captionId, qualityStatus: contentOutputs.qualityStatus }).from(contentOutputs).where(eq(contentOutputs.generationId, generationId)).limit(1);
    if (!output?.imagePath || output.qualityStatus !== "approved") return withRequestId(jsonError("Only approved posts with generated images can be scheduled", 409, undefined, requestIdValue), requestIdValue);
    const [connection] = await db.select({ id: instagramConnections.id, status: instagramConnections.status }).from(instagramConnections).where(and(eq(instagramConnections.businessId, business.id), eq(instagramConnections.status, "active"))).limit(1);
    if (!connection) return withRequestId(jsonError("Instagram connection requires reconnect", 409, { reconnectRequired: true }, requestIdValue), requestIdValue);
    if (update) {
      const schedule = updateSchedule!;
      if (schedule.status !== "scheduled") return withRequestId(jsonError("Only scheduled posts can be updated", 409, undefined, requestIdValue), requestIdValue);
      const [updated] = await db.update(instagramSchedules).set({ scheduledFor, caption: caption ?? schedule.caption, updatedAt: new Date() }).where(eq(instagramSchedules.id, schedule.id)).returning();
      await recordAudit({ businessId: business.id, actorUserId: user.id, action: "instagram.schedule.updated", entityType: "instagram_schedule", entityId: schedule.id, requestId: requestIdValue, metadata: { scheduledFor: scheduledFor.toISOString() } }).catch(() => undefined);
      return withRequestId(Response.json({ data: updated, requestId: requestIdValue }), requestIdValue);
    }
    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey || idempotencyKey.length > 128) return withRequestId(jsonError("Idempotency-Key header is required", 400, undefined, requestIdValue), requestIdValue);
    const [existing] = await db.select().from(instagramSchedules).where(and(eq(instagramSchedules.businessId, business.id), eq(instagramSchedules.idempotencyKey, idempotencyKey))).limit(1);
    if (existing) return withRequestId(Response.json({ data: existing, requestId: requestIdValue }), requestIdValue);
    const [active] = await db.select({ id: instagramSchedules.id }).from(instagramSchedules).where(and(eq(instagramSchedules.businessId, business.id), eq(instagramSchedules.generationId, generationId), eq(instagramSchedules.mediaType, mediaType as string), eq(instagramSchedules.status, "scheduled"))).limit(1);
    if (active) return withRequestId(jsonError("Post already has a scheduled publish", 409, { scheduleId: active.id }, requestIdValue), requestIdValue);
    const [published] = await db.select({ id: instagramPublishJobs.id }).from(instagramPublishJobs).where(and(eq(instagramPublishJobs.businessId, business.id), eq(instagramPublishJobs.generationId, generationId), eq(instagramPublishJobs.mediaType, mediaType as string), eq(instagramPublishJobs.status, "succeeded"))).limit(1);
    if (published) return withRequestId(jsonError("This post was already published to Instagram", 409, { jobId: published.id }, requestIdValue), requestIdValue);
    const now = new Date();
    const [schedule] = await db.insert(instagramSchedules).values({ id: randomUUID(), businessId: business.id, generationId, mediaType: mediaType as string, scheduledFor, status: "scheduled", caption: caption ?? output.captionId, idempotencyKey, attempts: 0, createdAt: now, updatedAt: now }).onConflictDoNothing({ target: [instagramSchedules.businessId, instagramSchedules.idempotencyKey] }).returning();
    if (!schedule) {
      const [sameRequest] = await db.select().from(instagramSchedules).where(and(eq(instagramSchedules.businessId, business.id), eq(instagramSchedules.idempotencyKey, idempotencyKey))).limit(1);
      if (sameRequest) return withRequestId(Response.json({ data: sameRequest, requestId: requestIdValue }), requestIdValue);
      return withRequestId(jsonError("Could not create Instagram schedule", 409, undefined, requestIdValue), requestIdValue);
    }
    await recordAudit({ businessId: business.id, actorUserId: user.id, action: "instagram.schedule.created", entityType: "instagram_schedule", entityId: schedule.id, requestId: requestIdValue, metadata: { generationId, mediaType: mediaType as string, scheduledFor: scheduledFor.toISOString() } }).catch(() => undefined);
    return withRequestId(Response.json({ data: schedule, requestId: requestIdValue }, { status: 201 }), requestIdValue);
  } catch (error) {
    console.error("Instagram schedule mutation failed", error);
    return withRequestId(jsonError("Could not save Instagram schedule", 500, undefined, requestIdValue), requestIdValue);
  }
}
