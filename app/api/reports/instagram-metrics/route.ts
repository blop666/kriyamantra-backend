import { and, desc, eq, gte, lte } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { getOwnedBusiness } from "@/lib/domain/business";
import { instagramMedia, instagramMetricSnapshots } from "@/lib/db/schema";
import { requestId, structuredError, withRequestId } from "@/lib/http";

export async function GET(request: Request) {
  const id = requestId(request);
  const auth = await getOwnedBusiness();
  if (auth.error) return withRequestId(structuredError("RPT_AUTH_REQUIRED", auth.error, 401, undefined, id), id);
  if (!auth.business) return withRequestId(structuredError("RPT_BUSINESS_REQUIRED", "Business profile required", 404, undefined, id), id);
  const url = new URL(request.url);
  const from = parseDate(url.searchParams.get("from"));
  const to = parseDate(url.searchParams.get("to"));
  if ((url.searchParams.has("from") && !from) || (url.searchParams.has("to") && !to)) return withRequestId(structuredError("RPT_METRIC_PERIOD_INVALID", "from and to must be ISO timestamps", 422, undefined, id), id);
  const rows = await getDb().select({ media: instagramMedia, snapshot: instagramMetricSnapshots }).from(instagramMedia).leftJoin(instagramMetricSnapshots, eq(instagramMetricSnapshots.instagramMediaId, instagramMedia.id)).where(and(eq(instagramMedia.businessId, auth.business.id), from ? gte(instagramMedia.publishedAt, from) : undefined, to ? lte(instagramMedia.publishedAt, to) : undefined)).orderBy(desc(instagramMedia.publishedAt), desc(instagramMetricSnapshots.collectedAt));
  const grouped = new Map<string, { media: typeof rows[number]["media"]; latestSnapshot: typeof rows[number]["snapshot"] }>();
  for (const row of rows) {
    const current = grouped.get(row.media.id);
    if (!current || (row.snapshot && (!current.latestSnapshot || row.snapshot.collectedAt > current.latestSnapshot.collectedAt))) grouped.set(row.media.id, { media: row.media, latestSnapshot: row.snapshot });
  }
  return withRequestId(Response.json({ data: [...grouped.values()], requestId: id }), id);
}

function parseDate(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
