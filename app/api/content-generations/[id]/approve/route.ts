import { and, eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs, conversations } from "@/lib/db/schema";
import { jsonError, readJson } from "@/lib/http";
import { recordAudit } from "@/lib/audit";
import { requestId, withRequestId } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = requestId(request);
  const body = await readJson(request);
  if (!body || typeof body !== "object" || (body as Record<string, unknown>).confirmed !== true) {
    return withRequestId(jsonError("confirmed=true is required", 400, undefined, id), id);
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return withRequestId(jsonError("Authentication required", 401, undefined, id), id);
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (!business) return withRequestId(jsonError("Business profile required", 400, undefined, id), id);
    const generationId = (await params).id;
    const db = getDb();
    const [generation] = await db.select({ id: contentGenerations.id, businessId: contentGenerations.businessId, status: contentGenerations.status, conversationId: contentGenerations.conversationId }).from(contentGenerations).where(and(eq(contentGenerations.id, generationId), eq(contentGenerations.businessId, business.id))).limit(1);
    if (!generation) return withRequestId(jsonError("Generation not found", 404, undefined, id), id);
    if (generation.status !== "succeeded") return withRequestId(jsonError("Generation is not ready for approval", 409, { status: generation.status }, id), id);
    const [output] = await db.select({ id: contentOutputs.id }).from(contentOutputs).where(eq(contentOutputs.generationId, generationId)).limit(1);
    if (!output) return withRequestId(jsonError("Generated output not found", 404, undefined, id), id);
    await db.transaction(async (tx) => {
      await tx.update(contentOutputs).set({ qualityStatus: "approved", isSelected: true }).where(eq(contentOutputs.id, output.id));
      await tx.update(conversations).set({ state: "approved", updatedAt: new Date() }).where(eq(conversations.id, generation.conversationId));
    });
    await recordAudit({ businessId: business.id, actorUserId: user.id, action: "content.approved", entityType: "content_generation", entityId: generationId, requestId: id, metadata: { outputId: output.id } }).catch(() => undefined);
    return withRequestId(Response.json({ generationId, outputId: output.id, qualityStatus: "approved" }), id);
  } catch (error) {
    console.error("Content approval failed", error);
    return withRequestId(jsonError("Could not approve content", 500, undefined, id), id);
  }
}
