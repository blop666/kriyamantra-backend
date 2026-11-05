import { and, asc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/client";
import { products, weeklyTaskSets, weeklyTasks } from "@/lib/db/schema";
import { getOwnedBusiness } from "@/lib/domain/business";
import { taskTemplates } from "@/lib/domain/tasks";
import { weeklyPeriod } from "@/lib/domain/time";
import { requestId, structuredError, withRequestId } from "@/lib/http";

export async function GET(request: Request) {
  const requestIdValue = requestId(request);
  const auth = await getOwnedBusiness();
  if (auth.error) return withRequestId(structuredError("TSK_AUTH_REQUIRED", auth.error, 401, undefined, requestIdValue), requestIdValue);
  if (!auth.business) return withRequestId(structuredError("TSK_BUSINESS_REQUIRED", "Business profile required", 404, undefined, requestIdValue), requestIdValue);
  const business = auth.business;
  const timeZone = business.timezone || "Asia/Makassar";
  const period = weeklyPeriod(new Date(), timeZone);
  const db = getDb();
  let [set] = await db.select().from(weeklyTaskSets).where(and(eq(weeklyTaskSets.businessId, business.id), eq(weeklyTaskSets.periodStart, period.start), eq(weeklyTaskSets.periodEnd, period.end), eq(weeklyTaskSets.timezone, timeZone))).limit(1);
  if (!set) {
    const [product] = await db.select({ id: products.id, name: products.name }).from(products).where(eq(products.businessId, business.id)).orderBy(asc(products.createdAt)).limit(1);
    const now = new Date();
    try {
      set = await db.transaction(async (tx) => {
        const [created] = await tx.insert(weeklyTaskSets).values({ id: randomUUID(), businessId: business.id, periodStart: period.start, periodEnd: period.end, timezone: timeZone, generationKey: `${business.id}:${period.start.toISOString()}:${period.end.toISOString()}`, createdAt: now, updatedAt: now }).returning();
        if (!created) throw new Error("Task set creation failed");
        const templates = taskTemplates(product?.name);
        await tx.insert(weeklyTasks).values(templates.map((task) => ({ id: randomUUID(), businessId: business.id, taskSetId: created.id, ...task, status: "todo" as const, dueAt: period.end, productId: product?.id ?? null, contentGenerationId: null, createdAt: now, updatedAt: now, completedAt: null })));
        return created;
      });
    } catch (error) {
      [set] = await db.select().from(weeklyTaskSets).where(and(eq(weeklyTaskSets.businessId, business.id), eq(weeklyTaskSets.periodStart, period.start), eq(weeklyTaskSets.periodEnd, period.end), eq(weeklyTaskSets.timezone, timeZone))).limit(1);
      if (!set) throw error;
    }
  }
  const items = await db.select().from(weeklyTasks).where(and(eq(weeklyTasks.businessId, business.id), eq(weeklyTasks.taskSetId, set.id))).orderBy(asc(weeklyTasks.priority));
  const completed = items.filter((task) => task.status === "done").length;
  return withRequestId(Response.json({ items, nextCursor: null, period: { start: period.start.toISOString(), end: period.end.toISOString(), timezone: timeZone }, progress: { completed, total: items.length }, requestId: requestIdValue }), requestIdValue);
}
