import { and, eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { instagramPublishJobs } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required", 401);
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (!business) return jsonError("Business profile required", 400);
  const [job] = await getDb().select({ id: instagramPublishJobs.id, generationId: instagramPublishJobs.generationId, mediaType: instagramPublishJobs.mediaType, status: instagramPublishJobs.status, providerMediaId: instagramPublishJobs.providerMediaId, providerError: instagramPublishJobs.providerError, publishedAt: instagramPublishJobs.publishedAt }).from(instagramPublishJobs).where(and(eq(instagramPublishJobs.id, (await params).id), eq(instagramPublishJobs.businessId, business.id))).limit(1);
  if (!job) return jsonError("Instagram publish job not found", 404);
  return Response.json({ job });
}
