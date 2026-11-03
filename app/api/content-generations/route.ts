import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { generateXkiroText } from "@/lib/ai/xkiro/client";
import { XkiroError } from "@/lib/ai/xkiro/types";
import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs, conversations, products } from "@/lib/db/schema";
import { jsonError, readJson } from "@/lib/http";
import { copyGenerationPrompt, parseCopyResult, parseGenerationInput } from "@/lib/domain/generation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const input = parseGenerationInput(await readJson(request));
  if (!input) return jsonError("Invalid generation payload", 400);

  let generationId: string | undefined;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return jsonError("Authentication required", 401);
    const { data: business } = await supabase.from("businesses").select("id, name, category, location, story, languages, tone, instagram_handle, contact_phone").eq("owner_id", user.id).maybeSingle();
    if (!business) return jsonError("Business profile required", 400);

    const db = getDb();
    const [conversation] = await db.select({ id: conversations.id, state: conversations.state }).from(conversations).where(and(eq(conversations.id, input.conversationId), eq(conversations.businessId, business.id))).limit(1);
    if (!conversation) return jsonError("Conversation not found", 404);
    if (conversation.state !== "confirm_generation") return jsonError("Conversation is not ready for generation", 409, { currentState: conversation.state, requiredState: "confirm_generation", hint: "Send an explicit confirmation message through /api/chat first." });
    const [product] = await db.select({ id: products.id, name: products.name, description: products.description, materials: products.materials, price: products.price, imagePath: products.imagePath }).from(products).where(and(eq(products.id, input.productId), eq(products.businessId, business.id))).limit(1);
    if (!product) return jsonError("Product not found", 404);
    if (!product.imagePath) return jsonError("Product image required before generation", 400);

    const now = new Date();
    generationId = randomUUID();
    const payload = { format: input.format, angle: input.angle, business, product };
    await db.insert(contentGenerations).values({ id: generationId, businessId: business.id, productId: product.id, conversationId: conversation.id, status: "processing", format: input.format, requestPayload: payload, createdAt: now });
    const result = await generateXkiroText({ messages: [{ role: "system", content: copyGenerationPrompt }, { role: "user", content: JSON.stringify(payload) }] });
    const output = parseCopyResult(result.text);
    if (!output) {
      await db.update(contentGenerations).set({ status: "failed", errorMessage: "AI returned an invalid copy response", completedAt: new Date() }).where(eq(contentGenerations.id, generationId));
      return jsonError("AI returned an invalid response", 502);
    }
    const outputId = randomUUID();
    await db.insert(contentOutputs).values({ id: outputId, generationId, version: 1, captionId: output.captionId, captionEn: output.captionEn, hashtags: output.hashtags, creativeBrief: { ...output.creativeBrief, altText: output.altText, warnings: output.warnings }, qualityStatus: "draft", isSelected: false, createdAt: new Date() });
    await db.update(contentGenerations).set({ status: "succeeded", completedAt: new Date() }).where(eq(contentGenerations.id, generationId));
    return Response.json({ generationId, status: "succeeded", output: { id: outputId, ...output, qualityStatus: "draft" } }, { status: 201 });
  } catch (error) {
    if (generationId) {
      await getDb().update(contentGenerations).set({ status: "failed", errorMessage: error instanceof Error ? error.message : "Unknown generation error", completedAt: new Date() }).where(eq(contentGenerations.id, generationId)).catch(() => undefined);
    }
    if (error instanceof XkiroError) return jsonError(error.message, error.code === "timeout" ? 504 : 502);
    console.error("Content generation failed", error);
    return jsonError("Could not generate content", 500);
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Authentication required", 401);
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (!business) return jsonError("Business profile required", 400);
    const rows = await getDb().select().from(contentGenerations).where(eq(contentGenerations.businessId, business.id)).orderBy(desc(contentGenerations.createdAt));
    return Response.json({ generations: rows });
  } catch (error) {
    console.error("Content generations lookup failed", error);
    return jsonError("Could not load content generations", 500);
  }
}
