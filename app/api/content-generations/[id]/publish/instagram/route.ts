import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs, instagramConnections, instagramPublishJobs } from "@/lib/db/schema";
import { jsonError, readJson } from "@/lib/http";
import { createContainer, publishContainer } from "@/lib/integrations/instagram/api";
import { decrypt } from "@/lib/integrations/instagram/crypto";
import { XkiroError } from "@/lib/ai/xkiro/types";

type PublishInput = { mediaType: "FEED" | "STORIES"; caption?: string; confirmed: true };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let jobId: string | undefined;
  try {
    const input = await parseInput(await readJson(request));
    if (!input) return jsonError("mediaType and confirmed=true are required", 400);
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Authentication required", 401);
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (!business) return jsonError("Business profile required", 400);
    const generationId = (await params).id;
    const db = getDb();
    const [generation] = await db.select({ id: contentGenerations.id, businessId: contentGenerations.businessId }).from(contentGenerations).where(and(eq(contentGenerations.id, generationId), eq(contentGenerations.businessId, business.id))).limit(1);
    if (!generation) return jsonError("Generation not found", 404);
    const [output] = await db.select({ imagePath: contentOutputs.imagePath, captionId: contentOutputs.captionId }).from(contentOutputs).where(eq(contentOutputs.generationId, generationId)).limit(1);
    if (!output?.imagePath) return jsonError("Generated image required before publishing", 409);
    const [connection] = await db.select().from(instagramConnections).where(and(eq(instagramConnections.businessId, business.id), eq(instagramConnections.status, "active"))).limit(1);
    if (!connection) return jsonError("Connect an Instagram Professional account first", 409);

    const accessToken = decrypt(connection.accessTokenEncrypted);
    const { data: signed } = await supabase.storage.from("generated-images").createSignedUrl(output.imagePath, 86_400);
    if (!signed?.signedUrl) return jsonError("Could not create publishable image URL", 502);
    const caption = input.caption?.trim() || output.captionId;
    jobId = randomUUID();
    await db.insert(instagramPublishJobs).values({ id: jobId, businessId: business.id, connectionId: connection.id, generationId, mediaType: input.mediaType, caption, status: "processing", confirmedAt: new Date(), createdAt: new Date() });
    const containerId = await createContainer({ userId: connection.instagramUserId, accessToken, imageUrl: signed.signedUrl, caption, mediaType: input.mediaType });
    const providerMediaId = await publishContainer(connection.instagramUserId, accessToken, containerId);
    await db.update(instagramPublishJobs).set({ containerId, providerMediaId, status: "succeeded", publishedAt: new Date() }).where(eq(instagramPublishJobs.id, jobId));
    return Response.json({ jobId, status: "succeeded", mediaType: input.mediaType, instagramMediaId: providerMediaId }, { status: 201 });
  } catch (error) {
    if (jobId) await getDb().update(instagramPublishJobs).set({ status: "failed", providerError: error instanceof Error ? error.message : "Instagram publish failed" }).where(eq(instagramPublishJobs.id, jobId)).catch(() => undefined);
    if (error instanceof XkiroError) return jsonError(error.message, error.code === "configuration" ? 500 : 502, { providerStatus: error.status ?? null });
    console.error("Instagram publish failed", error);
    return jsonError("Could not publish to Instagram", 502);
  }
}

async function parseInput(value: unknown): Promise<PublishInput | null> {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const mediaType = input.mediaType === "STORIES" ? "STORIES" : input.mediaType === "FEED" ? "FEED" : null;
  const caption = input.caption === undefined ? undefined : typeof input.caption === "string" ? input.caption.trim() : null;
  if (!mediaType || caption === null || input.confirmed !== true || (caption && caption.length > 2200)) return null;
  return { mediaType, caption, confirmed: true };
}
