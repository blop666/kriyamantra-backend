import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { reportRecommendations, weeklyReports } from "@/lib/db/schema";
import { getOwnedBusiness } from "@/lib/domain/business";
import { requestId, structuredError, withRequestId } from "@/lib/http";

export async function GET(request: Request) {
  const id = requestId(request);
  const auth = await getOwnedBusiness();
  if (auth.error) return withRequestId(structuredError("RPT_AUTH_REQUIRED", auth.error, 401, undefined, id), id);
  if (!auth.business) return withRequestId(structuredError("RPT_BUSINESS_REQUIRED", "Business profile required", 404, undefined, id), id);
  const reportId = new URL(request.url).searchParams.get("reportId");
  if (!reportId) return withRequestId(structuredError("RPT_REPORT_REQUIRED", "reportId is required", 422, undefined, id), id);
  const [report] = await getDb().select({ id: weeklyReports.id }).from(weeklyReports).where(and(eq(weeklyReports.id, reportId), eq(weeklyReports.businessId, auth.business.id))).limit(1);
  if (!report) return withRequestId(structuredError("RPT_NOT_FOUND", "Report not found", 404, undefined, id), id);
  const items = await getDb().select().from(reportRecommendations).where(and(eq(reportRecommendations.weeklyReportId, reportId), eq(reportRecommendations.businessId, auth.business.id))).orderBy(asc(reportRecommendations.createdAt));
  return withRequestId(Response.json({ items, nextCursor: null, requestId: id }), id);
}
