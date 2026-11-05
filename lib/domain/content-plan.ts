import { randomUUID } from "node:crypto";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { products, weeklyContentPlanItems, weeklyContentPlans } from "@/lib/db/schema";

type PlanInput = {
  businessId: string;
  reportId: string;
  periodStart: Date;
  periodEnd: Date;
  totalTasks: number;
  publishedPosts: number;
};

function targetPostCount(totalTasks: number, publishedPosts: number) {
  const capacity = Math.max(2, Math.min(5, Math.ceil(Math.max(totalTasks, 3) / 2)));
  return Math.max(2, Math.min(5, Math.max(capacity, publishedPosts > 0 ? 2 : 3)));
}

export async function ensureWeeklyContentPlan(input: PlanInput) {
  const db = getDb();
  const [existing] = await db.select().from(weeklyContentPlans).where(and(eq(weeklyContentPlans.businessId, input.businessId), eq(weeklyContentPlans.weeklyReportId, input.reportId))).limit(1);
  if (existing) {
    const items = await db.select().from(weeklyContentPlanItems).where(and(eq(weeklyContentPlanItems.businessId, input.businessId), eq(weeklyContentPlanItems.planId, existing.id))).orderBy(asc(weeklyContentPlanItems.sequence));
    return { plan: existing, items };
  }

  const targetPosts = targetPostCount(input.totalTasks, input.publishedPosts);
  const availableProducts = await db.select({ id: products.id }).from(products).where(and(eq(products.businessId, input.businessId), isNotNull(products.imagePath))).orderBy(asc(products.createdAt)).limit(targetPosts);
  const now = new Date();
  const plan = await db.transaction(async (tx) => {
    const [created] = await tx.insert(weeklyContentPlans).values({ id: randomUUID(), businessId: input.businessId, weeklyReportId: input.reportId, targetPosts, status: "planned", createdAt: now, updatedAt: now }).returning();
    if (!created) throw new Error("Content plan creation failed");
    const interval = (input.periodEnd.getTime() - input.periodStart.getTime()) / targetPosts;
    const items = Array.from({ length: targetPosts }, (_, index) => ({
      id: randomUUID(), businessId: input.businessId, planId: created.id, sequence: index + 1,
      productId: availableProducts[index % Math.max(availableProducts.length, 1)]?.id ?? null,
      format: index % 3 === 2 ? "story" as const : "feed" as const,
      angle: ["Cerita proses pembuatan", "Detail produk dan bahan", "Ajakan melihat koleksi"][index % 3],
      scheduledFor: new Date(input.periodStart.getTime() + interval * (index + 1)),
      status: "planned" as const, generationId: null, createdAt: now, updatedAt: now,
    }));
    await tx.insert(weeklyContentPlanItems).values(items);
    return { plan: created, items };
  });
  return plan;
}
