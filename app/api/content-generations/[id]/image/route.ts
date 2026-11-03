import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { createXkiroImage, pollXkiroImage, XkiroImageJob } from "@/lib/ai/xkiro/image";
import { XkiroError } from "@/lib/ai/xkiro/types";
import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs, conversations, products } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authorizedGeneration(await params);
    if (context.error) return context.error;
    const { generation, output, product, business, supabase } = context;
    if (!output) return jsonError("Draft output required before image generation", 409);
    if (!product.imagePath) return jsonError("Product reference image required before image generation", 409);
    if (generation.imageStatus === "processing" && generation.imageJobId) return Response.json({ generationId: generation.id, imageStatus: generation.imageStatus, imageJobId: generation.imageJobId }, { status: 202 });
    if (generation.imageStatus === "succeeded" && output.imagePath) return Response.json({ generationId: generation.id, imageStatus: "succeeded", imagePath: output.imagePath, imageUrl: await signedUrl(supabase, output.imagePath) });

    const brief = output.creativeBrief as Record<string, unknown>;
    const prompt = `Design a polished Indonesian MARKETING POSTER for social media, not a plain product photograph and not a lifestyle photo.

FORMAT: ${generation.format === "story" ? "vertical 9:16 story poster" : "portrait or square social feed poster"}.
BUSINESS: ${business.name}.
INSTAGRAM: ${business.instagram_handle ?? "Do not invent an Instagram handle"}.
CONTACT PHONE: ${business.contact_phone ?? "Do not invent a phone number"}.
PRODUCT: ${product.name}.
DESCRIPTION: ${product.description ?? ""}.
MATERIAL: ${product.materials ?? ""}.
PRICE: ${product.price ? `Rp${product.price}` : "Do not invent a price"}.
CREATIVE ANGLE: ${String(brief.angle ?? "")}. MOOD: ${String(brief.mood ?? "")}.
POSTER LAYOUT: ${String(brief.composition ?? "")}
REQUIRED FACTUAL OVERLAY TEXT: ${String(brief.overlayText ?? "")}

Use the uploaded product photo as the exact product reference: preserve its shape, carving, material, and recognizable details. Make the product the hero element, but build a complete advertisement around it: strong headline, clear visual hierarchy, promotional price area when provided, short benefit/CTA, branded decorative elements, and a clean footer. Use attractive Indonesian design inspired by Bali craftsmanship without inventing claims. Do not output an isolated studio product shot. Do not add phone numbers, social handles, prices, certifications, or claims unless supplied above. Keep text short, legible, correctly spelled, and inside the canvas. If exact text rendering is uncertain, prioritize the poster layout and leave clean space for typography rather than generating gibberish.`;
    const { data: referenceImage, error: referenceError } = await supabase.storage.from("product-images").download(product.imagePath);
    if (referenceError || !referenceImage) return jsonError("Could not load product reference image", 502);
    const job = await createXkiroImage(prompt, generation.format, referenceImage);
    await getDb().update(contentGenerations).set({ imageStatus: job.status, imageJobId: job.id, imageError: null }).where(eq(contentGenerations.id, generation.id));
    await getDb().update(conversations).set({ state: "generating", updatedAt: new Date() }).where(eq(conversations.id, generation.conversationId));
    // Keep job creation asynchronous. CDN download and Storage upload belong to GET polling.
    // This prevents a fast provider response from turning POST into a long-running request.
    return Response.json({ generationId: generation.id, imageStatus: job.status, imageJobId: job.id }, { status: 202 });
  } catch (error) {
    return imageError(error);
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authorizedGeneration(await params);
    if (context.error) return context.error;
    const { generation, output, supabase } = context;
    if (!generation.imageJobId) return Response.json({ generationId: generation.id, imageStatus: generation.imageStatus ?? null });
    if (generation.imageStatus === "succeeded" || generation.imageStatus === "failed") {
      if (generation.imageStatus === "failed") return Response.json({ generationId: generation.id, imageStatus: "failed", error: generation.imageError }, { status: 502 });
      return Response.json({ generationId: generation.id, imageStatus: generation.imageStatus, imagePath: output?.imagePath ?? null, imageUrl: output?.imagePath ? await signedUrl(supabase, output.imagePath) : null, error: generation.imageError });
    }

    const job = await pollXkiroImage(generation.imageJobId);
    if (job.status === "failed") {
      const error = job.error || "Xkiro image job failed";
      await getDb().update(contentGenerations).set({ imageStatus: "failed", imageError: error, completedAt: new Date() }).where(eq(contentGenerations.id, generation.id));
      return Response.json({ generationId: generation.id, imageStatus: "failed", error }, { status: 502 });
    }
    if (job.status === "succeeded" && output) {
      try {
        const imagePath = await saveImage(job, supabase, context.userId, generation.id);
        await getDb().update(contentOutputs).set({ imagePath }).where(eq(contentOutputs.id, output.id));
        await getDb().update(contentGenerations).set({ imageStatus: "succeeded", imageError: null, completedAt: new Date() }).where(eq(contentGenerations.id, generation.id));
        await getDb().update(conversations).set({ state: "review_output", updatedAt: new Date() }).where(eq(conversations.id, generation.conversationId));
        return Response.json({ generationId: generation.id, imageStatus: "succeeded", imagePath, imageUrl: await signedUrl(supabase, imagePath) });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not save generated image";
        await getDb().update(contentGenerations).set({ imageStatus: "failed", imageError: message, completedAt: new Date() }).where(eq(contentGenerations.id, generation.id));
        return imageError(error);
      }
    }
    return Response.json({ generationId: generation.id, imageStatus: "processing", imageJobId: generation.imageJobId }, { status: 202 });
  } catch (error) {
    return imageError(error);
  }
}

async function authorizedGeneration({ id }: { id: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: jsonError("Authentication required", 401) };
  const { data: business } = await supabase.from("businesses").select("id, name, instagram_handle, contact_phone").eq("owner_id", user.id).maybeSingle();
  if (!business) return { error: jsonError("Business profile required", 400) };
  const db = getDb();
  const [generation] = await db.select().from(contentGenerations).where(and(eq(contentGenerations.id, id), eq(contentGenerations.businessId, business.id))).limit(1);
  if (!generation) return { error: jsonError("Generation not found", 404) };
  const [output] = await db.select().from(contentOutputs).where(eq(contentOutputs.generationId, id)).limit(1);
    const [product] = await db.select({ name: products.name, description: products.description, materials: products.materials, price: products.price, imagePath: products.imagePath }).from(products).where(eq(products.id, generation.productId)).limit(1);
  if (!product) return { error: jsonError("Product not found", 404) };
  return { generation, output, product, business, supabase, userId: user.id };
}

async function saveImage(job: XkiroImageJob, supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string, generationId: string) {
  const bytes = job.base64 ? Buffer.from(job.base64, "base64") : await downloadImage(job.url);
  if (!bytes || bytes.length > 10 * 1024 * 1024) throw new XkiroError("Generated image is invalid or too large", "invalid_response");
  const path = `${userId}/${generationId}/${randomUUID()}.png`;
  const { error } = await supabase.storage.from("generated-images").upload(path, bytes, { contentType: "image/png", upsert: false });
  if (error) throw new XkiroError("Could not store generated image", "provider");
  return path;
}

async function downloadImage(url: string | null) {
  if (!url) throw new XkiroError("Xkiro returned no image data", "invalid_response");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal, cache: "no-store" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new XkiroError("Generated image download timed out", "timeout");
    throw new XkiroError("Could not download generated image", "provider");
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new XkiroError("Could not download generated image", "provider", response.status);
  const type = response.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) throw new XkiroError("Xkiro returned a non-image result", "invalid_response");
  return Buffer.from(await response.arrayBuffer());
}

async function signedUrl(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, path: string) {
  const { data, error } = await supabase.storage.from("generated-images").createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new XkiroError("Could not create generated image URL", "provider");
  return data.signedUrl;
}

function imageError(error: unknown) {
  if (error instanceof XkiroError) return jsonError(error.message, error.code === "timeout" ? 504 : 502, { code: error.code, providerStatus: error.status ?? null });
  console.error("Image generation failed", error);
  return jsonError("Could not process image generation", 500);
}
