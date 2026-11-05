import { and, eq, lte } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs, instagramConnections, instagramPublishJobs, instagramSchedules } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/integrations/instagram/crypto";
import { createContainer, publishContainer } from "@/lib/integrations/instagram/api";
import { XkiroError } from "@/lib/ai/xkiro/types";
import { safeScheduleError, MAX_SCHEDULE_RETRIES } from "@/lib/schedule";
import { recordAudit } from "@/lib/audit";
import { requestId, withRequestId } from "@/lib/http";

const BATCH_SIZE = 10;

export async function POST(request: Request) {
  const requestIdValue = requestId(request);
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return withRequestId(Response.json({ error: "Unauthorized", requestId: requestIdValue }, { status: 401 }), requestIdValue);
  const db = getDb();
  const now = new Date();
  const staleBefore = new Date(now.getTime() - 15 * 60_000);
  await db.update(instagramSchedules).set({ status: "failed", lastError: "Scheduler execution timed out", attempts: MAX_SCHEDULE_RETRIES, updatedAt: now }).where(and(eq(instagramSchedules.status, "processing"), lte(instagramSchedules.updatedAt, staleBefore)));
  const candidates = await db.select({ id: instagramSchedules.id }).from(instagramSchedules).where(and(eq(instagramSchedules.status, "scheduled"), lte(instagramSchedules.scheduledFor, now))).limit(BATCH_SIZE);
  const results: Array<{ scheduleId: string; status: string }> = [];
  for (const candidate of candidates) {
    const [schedule] = await db.update(instagramSchedules).set({ status: "processing", updatedAt: now }).where(and(eq(instagramSchedules.id, candidate.id), eq(instagramSchedules.status, "scheduled"))).returning();
    if (!schedule) continue;
    try {
      await executeSchedule(schedule.id);
      results.push({ scheduleId: schedule.id, status: "published" });
    } catch (error) {
      const attempts = schedule.attempts + 1;
      await db.update(instagramSchedules).set({ status: "failed", attempts, lastError: safeScheduleError(error), updatedAt: new Date() }).where(eq(instagramSchedules.id, schedule.id));
      await recordAudit({ businessId: schedule.businessId, action: "instagram.schedule.failed", entityType: "instagram_schedule", entityId: schedule.id, requestId: request.headers.get("x-request-id") ?? randomUUID(), metadata: { attempts, retryable: attempts < MAX_SCHEDULE_RETRIES } }).catch(() => undefined);
      results.push({ scheduleId: schedule.id, status: "failed" });
    }
  }
  return withRequestId(Response.json({ processed: results.length, results, checkedAt: now.toISOString(), requestId: requestIdValue }), requestIdValue);
}

export { POST as GET };

async function executeSchedule(scheduleId: string) {
  const db = getDb();
  const [schedule] = await db.select().from(instagramSchedules).where(eq(instagramSchedules.id, scheduleId)).limit(1);
  if (!schedule) throw new Error("Schedule not found");
  const [connection] = await db.select().from(instagramConnections).where(and(eq(instagramConnections.businessId, schedule.businessId), eq(instagramConnections.status, "active"))).limit(1);
  if (!connection) throw new Error("Instagram connection requires reconnect");
  const [output] = await db.select({ imagePath: contentOutputs.imagePath, qualityStatus: contentOutputs.qualityStatus }).from(contentOutputs).innerJoin(contentGenerations, eq(contentGenerations.id, contentOutputs.generationId)).where(and(eq(contentOutputs.generationId, schedule.generationId), eq(contentGenerations.businessId, schedule.businessId))).limit(1);
  if (!output?.imagePath || output.qualityStatus !== "approved") throw new Error("Approved generated image required");
  const supabase = createSupabaseAdminClient();
  const { data: signed } = await supabase.storage.from("generated-images").createSignedUrl(output.imagePath, 3600);
  if (!signed?.signedUrl) throw new Error("Could not create publishable image URL");
  const token = decrypt(connection.accessTokenEncrypted);
  const [job] = await db.select().from(instagramPublishJobs).where(and(eq(instagramPublishJobs.generationId, schedule.generationId), eq(instagramPublishJobs.mediaType, schedule.mediaType), eq(instagramPublishJobs.businessId, schedule.businessId))).limit(1);
  if (job?.status === "succeeded") {
    await db.update(instagramSchedules).set({ status: "published", publishedAt: job.publishedAt ?? new Date(), updatedAt: new Date() }).where(eq(instagramSchedules.id, schedule.id));
    return;
  }
  if (job?.status === "processing") throw new Error("Instagram publish is already processing");
  const jobId = job?.id ?? randomUUID();
  if (job) await db.update(instagramPublishJobs).set({ status: "processing", providerError: null, connectionId: connection.id, caption: schedule.caption, confirmedAt: new Date() }).where(eq(instagramPublishJobs.id, job.id));
  else await db.insert(instagramPublishJobs).values({ id: jobId, businessId: schedule.businessId, connectionId: connection.id, generationId: schedule.generationId, mediaType: schedule.mediaType, caption: schedule.caption, status: "processing", confirmedAt: new Date(), createdAt: new Date() });
  try {
    const containerId = await createContainer({ userId: connection.instagramUserId, accessToken: token, imageUrl: signed.signedUrl, caption: schedule.caption, mediaType: schedule.mediaType as "FEED" | "STORIES" });
    const providerMediaId = await publishContainer(connection.instagramUserId, token, containerId);
    const publishedAt = new Date();
    await db.update(instagramPublishJobs).set({ containerId, providerMediaId, status: "succeeded", publishedAt }).where(eq(instagramPublishJobs.id, jobId));
    await db.update(instagramSchedules).set({ status: "published", publishedAt, updatedAt: publishedAt }).where(and(eq(instagramSchedules.id, schedule.id), eq(instagramSchedules.status, "processing")));
    await recordAudit({ businessId: schedule.businessId, action: "instagram.schedule.published", entityType: "instagram_schedule", entityId: schedule.id, requestId: randomUUID(), metadata: { providerMediaId } }).catch(() => undefined);
  } catch (error) {
    await db.update(instagramPublishJobs).set({ status: "failed", providerError: safeScheduleError(error) }).where(eq(instagramPublishJobs.id, jobId));
    if (error instanceof XkiroError && error.code === "provider_auth") await db.update(instagramConnections).set({ status: "revoked", updatedAt: new Date() }).where(eq(instagramConnections.id, connection.id));
    throw error;
  }
}
