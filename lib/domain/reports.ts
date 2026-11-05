import { randomUUID } from "node:crypto";
import { and, eq, gte, lte } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { instagramMedia, instagramMetricSnapshots, instagramPublishJobs, instagramSchedules, weeklyReports, weeklyTasks } from "@/lib/db/schema";
import { weeklyPeriod } from "@/lib/domain/time";

export async function buildWeeklyReport(businessId: string, timeZone: string, now = new Date()) {
  const period = weeklyPeriod(now, timeZone);
  const db = getDb();
  const nextPeriodStart = new Date(period.end.getTime() + 1);
  const nextPeriodEnd = new Date(nextPeriodStart.getTime() + 7 * 24 * 60 * 60_000 - 1);
  const [tasks, publishedJobs, failedJobs, nextSchedules, metrics] = await Promise.all([
    db.select({ status: weeklyTasks.status }).from(weeklyTasks).where(and(eq(weeklyTasks.businessId, businessId), gte(weeklyTasks.createdAt, period.start), lte(weeklyTasks.createdAt, period.end))),
    db.select({ id: instagramPublishJobs.id }).from(instagramPublishJobs).where(and(eq(instagramPublishJobs.businessId, businessId), eq(instagramPublishJobs.status, "succeeded"), gte(instagramPublishJobs.publishedAt, period.start), lte(instagramPublishJobs.publishedAt, period.end))),
    db.select({ id: instagramPublishJobs.id }).from(instagramPublishJobs).where(and(eq(instagramPublishJobs.businessId, businessId), eq(instagramPublishJobs.status, "failed"), gte(instagramPublishJobs.createdAt, period.start), lte(instagramPublishJobs.createdAt, period.end))),
    db.select({ id: instagramSchedules.id }).from(instagramSchedules).where(and(eq(instagramSchedules.businessId, businessId), eq(instagramSchedules.status, "scheduled"), gte(instagramSchedules.scheduledFor, nextPeriodStart), lte(instagramSchedules.scheduledFor, nextPeriodEnd))),
    db.select({ snapshot: instagramMetricSnapshots }).from(instagramMetricSnapshots).innerJoin(instagramMedia, eq(instagramMedia.id, instagramMetricSnapshots.instagramMediaId)).where(and(eq(instagramMetricSnapshots.businessId, businessId), eq(instagramMedia.businessId, businessId), eq(instagramMetricSnapshots.windowHours, 24), gte(instagramMedia.publishedAt, period.start), lte(instagramMedia.publishedAt, period.end))),
  ]);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(({ status }) => status === "done").length;
  return {
    period, dataThrough: now, totalTasks, completedTasks,
    snoozedTasks: tasks.filter(({ status }) => status === "snoozed").length,
    skippedTasks: tasks.filter(({ status }) => status === "skipped").length,
    completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : null,
    publishedPosts: publishedJobs.length, failedPosts: failedJobs.length,
    scheduledPostsNextPeriod: nextSchedules.length, instagramStatus: metrics.some(({ snapshot }) => snapshot.availabilityStatus === "available") ? "available" : "unavailable",
    metricSnapshots: metrics.map(({ snapshot }) => snapshot),
  };
}

export async function saveWeeklyReport(businessId: string, summary: Awaited<ReturnType<typeof buildWeeklyReport>>) {
  const db = getDb();
  const now = new Date();
  const values = {
    businessId, periodStart: summary.period.start, periodEnd: summary.period.end, timezone: summary.period.timeZone,
    status: "preliminary" as const, dataThrough: summary.dataThrough, totalTasks: summary.totalTasks,
    completedTasks: summary.completedTasks, snoozedTasks: summary.snoozedTasks, skippedTasks: summary.skippedTasks,
    completionRate: summary.completionRate?.toFixed(2) ?? null, publishedPosts: summary.publishedPosts,
    failedPosts: summary.failedPosts, scheduledPostsNextPeriod: summary.scheduledPostsNextPeriod,
    instagramStatus: summary.instagramStatus, updatedAt: now,
  };
  const [existing] = await db.select({ id: weeklyReports.id }).from(weeklyReports).where(and(eq(weeklyReports.businessId, businessId), eq(weeklyReports.periodStart, summary.period.start), eq(weeklyReports.periodEnd, summary.period.end), eq(weeklyReports.timezone, summary.period.timeZone))).limit(1);
  if (existing) {
    const [updated] = await db.update(weeklyReports).set(values).where(eq(weeklyReports.id, existing.id)).returning();
    return updated;
  }
  const [created] = await db.insert(weeklyReports).values({ id: randomUUID(), ...values, createdAt: now }).returning();
  return created;
}
