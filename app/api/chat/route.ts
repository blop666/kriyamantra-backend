import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError, readJson } from "@/lib/http";
import { generateXkiroText } from "@/lib/ai/xkiro/client";
import { XkiroError } from "@/lib/ai/xkiro/types";
import { getDb } from "@/lib/db/client";
import { conversations, messages, products } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { guidedAgentSystemPrompt, parseAgentResult, parseChatInput } from "@/lib/domain/chat";

export async function POST(request: Request) {
  const input = parseChatInput(await readJson(request));
  if (!input) return jsonError("Invalid chat payload", 400);

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return jsonError("Authentication required", 401);

    const { data: business } = await supabase.from("businesses").select("id, name, category, location, story, languages, tone, instagram_handle, contact_phone").eq("owner_id", user.id).maybeSingle();
    if (!business) return jsonError("Business profile required", 400);

    const db = getDb();
    let conversationId = input.conversationId;
    if (conversationId) {
      const existing = await db.select({ id: conversations.id }).from(conversations).where(and(eq(conversations.id, conversationId), eq(conversations.businessId, business.id))).limit(1);
      if (!existing[0]) return jsonError("Conversation not found", 404);
    } else {
      const created = await db.insert(conversations).values({ id: randomUUID(), businessId: business.id, channel: input.channel, state: "collect_context", createdAt: new Date(), updatedAt: new Date() }).returning({ id: conversations.id });
      conversationId = created[0]?.id;
    }
    if (!conversationId) return jsonError("Could not create conversation", 500);

    let productContext: unknown = null;
    if (input.productId) {
      const product = await db.select({ id: products.id, name: products.name, description: products.description, materials: products.materials, price: products.price, imagePath: products.imagePath }).from(products).where(and(eq(products.id, input.productId), eq(products.businessId, business.id))).limit(1);
      if (!product[0]) return jsonError("Product not found", 404);
      productContext = product[0];
    }

    await db.insert(messages).values({ id: randomUUID(), conversationId, role: "user", content: input.message, createdAt: new Date() });
    const history = await db.select({ role: messages.role, content: messages.content }).from(messages).where(eq(messages.conversationId, conversationId)).orderBy(asc(messages.createdAt)).limit(20);
    const result = await generateXkiroText({ messages: [
      { role: "system", content: `${guidedAgentSystemPrompt}\nBusiness context:\n${JSON.stringify(business)}\nProduct context:\n${JSON.stringify(productContext)}` },
      ...history.map((item) => ({ role: item.role as "user" | "assistant" | "system", content: item.content })),
    ] });
    const agent = parseAgentResult(result.text);
    if (!agent) return jsonError("AI returned an invalid response", 502);

    const saved = await db.insert(messages).values({ id: randomUUID(), conversationId, role: "assistant", content: agent.reply, metadata: { state: agent.state, missingFields: agent.missingFields, nextAction: agent.nextAction, readyForGeneration: agent.readyForGeneration, model: result.model }, createdAt: new Date() }).returning({ id: messages.id, createdAt: messages.createdAt });
    await db.update(conversations).set({ state: agent.state, updatedAt: new Date() }).where(eq(conversations.id, conversationId));
    return Response.json({ conversationId, message: { id: saved[0]?.id, role: "assistant", content: agent.reply, createdAt: saved[0]?.createdAt }, agent });
  } catch (error) {
    if (error instanceof XkiroError) return jsonError(error.message, error.code === "timeout" ? 504 : 502);
    console.error("Chat failed", error);
    return jsonError("Could not process chat", 500);
  }
}
