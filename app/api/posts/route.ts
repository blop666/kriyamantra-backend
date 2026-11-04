import { and, desc, eq, lt } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs, instagramSchedules } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required", 401);
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (!business) return jsonError("Business profile required", 400);
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 20), 1), 50);
  const cursor = url.searchParams.get("cursor");
  const cursorDate = cursor ? new Date(cursor) : null;
  if (cursor && (!cursorDate || Number.isNaN(cursorDate.getTime()))) return jsonError("Invalid cursor", 400);
  const rows = await getDb().select({
    id: instagramSchedules.id,
    generationId: instagramSchedules.generationId,
    mediaType: instagramSchedules.mediaType,
    scheduledFor: instagramSchedules.scheduledFor,
    status: instagramSchedules.status,
    caption: instagramSchedules.caption,
    attempts: instagramSchedules.attempts,
    lastError: instagramSchedules.lastError,
    createdAt: instagramSchedules.createdAt,
    qualityStatus: contentOutputs.qualityStatus,
  }).from(instagramSchedules)
    .innerJoin(contentGenerations, eq(contentGenerations.id, instagramSchedules.generationId))
    .innerJoin(contentOutputs, eq(contentOutputs.generationId, contentGenerations.id))
    .where(and(eq(instagramSchedules.businessId, business.id), cursorDate ? lt(instagramSchedules.createdAt, cursorDate) : undefined))
    .orderBy(desc(instagramSchedules.createdAt)).limit(limit + 1);
  const items = rows.slice(0, limit);
  return Response.json({ items, nextCursor: rows.length > limit ? items.at(-1)?.createdAt.toISOString() ?? null : null });
}
