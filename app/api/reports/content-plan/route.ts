import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { weeklyContentPlanItems, weeklyContentPlans, weeklyReports } from "@/lib/db/schema";
import { getOwnedBusiness } from "@/lib/domain/business";
import { requestId, structuredError, withRequestId } from "@/lib/http";

export async function GET(request: Request) {
  const id = requestId(request);
  const auth = await getOwnedBusiness();
  if (auth.error) return withRequestId(structuredError("RPT_AUTH_REQUIRED", auth.error, 401, undefined, id), id);
  if (!auth.business) return withRequestId(structuredError("RPT_BUSINESS_REQUIRED", "Business profile required", 404, undefined, id), id);
  const reportId = new URL(request.url).searchParams.get("reportId");
  if (!reportId) return withRequestId(structuredError("RPT_REPORT_REQUIRED", "reportId is required", 422, undefined, id), id);
  const [plan] = await getDb().select().from(weeklyContentPlans).innerJoin(weeklyReports, eq(weeklyReports.id, weeklyContentPlans.weeklyReportId)).where(and(eq(weeklyContentPlans.businessId, auth.business.id), eq(weeklyContentPlans.weeklyReportId, reportId), eq(weeklyReports.businessId, auth.business.id))).limit(1);
  if (!plan) return withRequestId(structuredError("RPT_CONTENT_PLAN_NOT_FOUND", "Content plan not found", 404, undefined, id), id);
  const items = await getDb().select().from(weeklyContentPlanItems).where(and(eq(weeklyContentPlanItems.businessId, auth.business.id), eq(weeklyContentPlanItems.planId, plan.weekly_content_plans.id))).orderBy(asc(weeklyContentPlanItems.sequence));
  return withRequestId(Response.json({ data: { plan: plan.weekly_content_plans, items }, requestId: id }), id);
}
