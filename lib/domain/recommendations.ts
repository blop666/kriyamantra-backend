import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { reportRecommendations, weeklyReports } from "@/lib/db/schema";

type ActivitySummary = {
  totalTasks: number;
  completedTasks: number;
  snoozedTasks: number;
  skippedTasks: number;
  completionRate: number | null;
  publishedPosts: number;
  failedPosts: number;
  instagramStatus: string;
};

export function evaluateActivityRules(summary: ActivitySummary) {
  const recommendations = [];
  if (summary.publishedPosts < 2) {
    recommendations.push({
      type: "content",
      title: "Rencanakan beberapa konten minggu depan",
      explanation: `Minggu ini tercatat ${summary.publishedPosts} post; target mingguan tidak dibatasi satu konten.`,
      action: "Gunakan content plan untuk membuat beberapa draft dari produk yang sama atau berbeda.",
      evidence: { metric: "publishedPosts", value: summary.publishedPosts, minimumSuggested: 2 },
      confidence: "medium",
    });
  }
  if (summary.completionRate !== null && summary.completionRate < 60) {
    recommendations.push({
      type: "task",
      title: "Pilih satu tugas yang paling penting",
      explanation: `Progress tugas minggu ini ${summary.completionRate.toFixed(0)}%.`,
      action: "Selesaikan satu tugas prioritas sebelum menambah tugas baru.",
      evidence: { metric: "completionRate", value: summary.completionRate, threshold: 60 },
      confidence: "medium",
    });
  }
  if (summary.snoozedTasks > 0) {
    recommendations.push({
      type: "activity",
      title: "Pecah tugas yang tertunda menjadi langkah kecil",
      explanation: `${summary.snoozedTasks} tugas ditunda minggu ini.`,
      action: "Ubah satu tugas tertunda menjadi tindakan yang dapat selesai dalam waktu singkat.",
      evidence: { metric: "snoozedTasks", value: summary.snoozedTasks },
      confidence: "medium",
    });
  }
  if (summary.instagramStatus !== "available") {
    recommendations.push({
      type: "measurement",
      title: "Fokus pada konsistensi aktivitas",
      explanation: "Data performa Instagram belum tersedia untuk dibandingkan.",
      action: "Gunakan penyelesaian tugas dan konsistensi posting sebagai fokus minggu depan.",
      evidence: { metric: "instagramStatus", value: summary.instagramStatus },
      confidence: "high",
    });
  }
  return recommendations.slice(0, 4);
}

export async function saveRuleRecommendations(businessId: string, reportId: string, summary: ActivitySummary) {
  const db = getDb();
  const [report] = await db.select({ id: weeklyReports.id }).from(weeklyReports).where(and(eq(weeklyReports.id, reportId), eq(weeklyReports.businessId, businessId))).limit(1);
  if (!report) return [];
  const recommendations = evaluateActivityRules(summary);
  await db.delete(reportRecommendations).where(and(eq(reportRecommendations.weeklyReportId, reportId), eq(reportRecommendations.businessId, businessId)));
  if (!recommendations.length) return [];
  return db.insert(reportRecommendations).values(recommendations.map((recommendation) => ({
    id: randomUUID(), businessId, weeklyReportId: reportId, ...recommendation, source: "rules", createdAt: new Date(),
  }))).returning();
}
