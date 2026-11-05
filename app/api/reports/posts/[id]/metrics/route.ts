import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { getOwnedBusiness } from "@/lib/domain/business";
import { instagramMedia, instagramMetricSnapshots } from "@/lib/db/schema";
import { requestId, structuredError, withRequestId } from "@/lib/http";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = requestId(request);
  const auth = await getOwnedBusiness();
  if (auth.error) return withRequestId(structuredError("RPT_AUTH_REQUIRED", auth.error, 401, undefined, id), id);
  if (!auth.business) return withRequestId(structuredError("RPT_BUSINESS_REQUIRED", "Business profile required", 404, undefined, id), id);
  const [media] = await getDb().select().from(instagramMedia).where(and(eq(instagramMedia.id, (await params).id), eq(instagramMedia.businessId, auth.business.id))).limit(1);
  if (!media) return withRequestId(structuredError("RPT_MEDIA_NOT_FOUND", "Instagram media not found", 404, undefined, id), id);
  const snapshots = await getDb().select().from(instagramMetricSnapshots).where(and(eq(instagramMetricSnapshots.instagramMediaId, media.id), eq(instagramMetricSnapshots.businessId, auth.business.id))).orderBy(asc(instagramMetricSnapshots.windowHours));
  return withRequestId(Response.json({ data: { media, snapshots }, requestId: id }), id);
}
