import { and, eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs, conversations } from "@/lib/db/schema";
import { jsonError, readJson } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await readJson(request);
  if (!body || typeof body !== "object" || (body as Record<string, unknown>).confirmed !== true) {
    return jsonError("confirmed=true is required", 400);
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Authentication required", 401);
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (!business) return jsonError("Business profile required", 400);
    const generationId = (await params).id;
    const db = getDb();
    const [generation] = await db.select({ id: contentGenerations.id, businessId: contentGenerations.businessId, status: contentGenerations.status, conversationId: contentGenerations.conversationId }).from(contentGenerations).where(and(eq(contentGenerations.id, generationId), eq(contentGenerations.businessId, business.id))).limit(1);
    if (!generation) return jsonError("Generation not found", 404);
    if (generation.status !== "succeeded") return jsonError("Generation is not ready for approval", 409, { status: generation.status });
    const [output] = await db.select({ id: contentOutputs.id }).from(contentOutputs).where(eq(contentOutputs.generationId, generationId)).limit(1);
    if (!output) return jsonError("Generated output not found", 404);
    await db.transaction(async (tx) => {
      await tx.update(contentOutputs).set({ qualityStatus: "approved", isSelected: true }).where(eq(contentOutputs.id, output.id));
      await tx.update(conversations).set({ state: "approved", updatedAt: new Date() }).where(eq(conversations.id, generation.conversationId));
    });
    return Response.json({ generationId, outputId: output.id, qualityStatus: "approved" });
  } catch (error) {
    console.error("Content approval failed", error);
    return jsonError("Could not approve content", 500);
  }
}
