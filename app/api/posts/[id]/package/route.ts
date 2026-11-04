import { and, eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs, instagramSchedules } from "@/lib/db/schema";
import { jsonError, requestId, withRequestId } from "@/lib/http";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestIdValue = requestId(request);
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return withRequestId(jsonError("Authentication required", 401, undefined, requestIdValue), requestIdValue);
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (!business) return withRequestId(jsonError("Business profile required", 400, undefined, requestIdValue), requestIdValue);
    const [row] = await getDb().select({ schedule: instagramSchedules, output: contentOutputs }).from(instagramSchedules).innerJoin(contentGenerations, eq(contentGenerations.id, instagramSchedules.generationId)).innerJoin(contentOutputs, eq(contentOutputs.generationId, contentGenerations.id)).where(and(eq(instagramSchedules.id, (await params).id), eq(instagramSchedules.businessId, business.id))).limit(1);
    if (!row) return withRequestId(jsonError("Schedule not found", 404, undefined, requestIdValue), requestIdValue);
    if (!row.output.imagePath) return withRequestId(jsonError("Generated image not found", 409, undefined, requestIdValue), requestIdValue);
    const { data: image, error } = await supabase.storage.from("generated-images").createSignedUrl(row.output.imagePath, 3600);
    if (error || !image?.signedUrl) return withRequestId(jsonError("Could not create downloadable media URL", 502, undefined, requestIdValue), requestIdValue);
    return withRequestId(Response.json({ data: { scheduleId: row.schedule.id, imageUrl: image.signedUrl, captionId: row.output.captionId, captionEn: row.output.captionEn, hashtags: row.output.hashtags }, requestId: requestIdValue }), requestIdValue);
  } catch (error) {
    console.error("Instagram upload package lookup failed", error);
    return withRequestId(jsonError("Could not load upload package", 500, undefined, requestIdValue), requestIdValue);
  }
}
