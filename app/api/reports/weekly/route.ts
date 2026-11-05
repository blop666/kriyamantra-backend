import { getOwnedBusiness } from "@/lib/domain/business";
import { buildWeeklyReport, saveWeeklyReport } from "@/lib/domain/reports";
import { saveRuleRecommendations } from "@/lib/domain/recommendations";
import { ensureWeeklyContentPlan } from "@/lib/domain/content-plan";
import { nextWeeklyPeriod } from "@/lib/domain/time";
import { requestId, structuredError, withRequestId } from "@/lib/http";

export async function GET(request: Request) {
  const id = requestId(request);
  const auth = await getOwnedBusiness();
  if (auth.error) return withRequestId(structuredError("RPT_AUTH_REQUIRED", auth.error, 401, undefined, id), id);
  if (!auth.business) return withRequestId(structuredError("RPT_BUSINESS_REQUIRED", "Business profile required", 404, undefined, id), id);
  const report = await buildWeeklyReport(auth.business.id, auth.business.timezone || "Asia/Makassar");
  const saved = await saveWeeklyReport(auth.business.id, report);
  const recommendations = saved ? await saveRuleRecommendations(auth.business.id, saved.id, report) : [];
  const nextPeriod = nextWeeklyPeriod(new Date(), auth.business.timezone || "Asia/Makassar");
  const contentPlan = saved ? await ensureWeeklyContentPlan({ businessId: auth.business.id, reportId: saved.id, periodStart: nextPeriod.start, periodEnd: nextPeriod.end, totalTasks: report.totalTasks, publishedPosts: report.publishedPosts }) : null;
  return withRequestId(Response.json({ data: { ...saved, activity: report, recommendations, contentPlan, instagram: { status: report.instagramStatus, reason: report.instagramStatus === "available" ? null : "insights_unavailable", snapshots: report.metricSnapshots }, disclaimer: "Aktivitas tercatat dari data KriyaMantra. Data performa Instagram hanya ditampilkan jika tersedia dari provider." }, requestId: id }), id);
}
