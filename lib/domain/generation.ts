export type GenerationInput = {
  conversationId: string;
  productId: string;
  format: "feed" | "story";
  angle: string;
  confirmed: true;
};

export function parseGenerationInput(value: unknown): GenerationInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const conversationId = uuid(input.conversationId);
  const productId = uuid(input.productId);
  const format = input.format === "story" ? "story" : input.format === "feed" ? "feed" : null;
  const angle = typeof input.angle === "string" ? input.angle.trim() : "";
  if (!conversationId || !productId || !format || angle.length < 2 || angle.length > 120 || input.confirmed !== true) return null;
  return { conversationId, productId, format, angle, confirmed: true };
}

function uuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

export const copyGenerationPrompt = `You create a production-ready marketing poster brief for KriyaMantra, not merely a product photo.
Use only facts in the supplied business and product context. Never invent price, material, origin, certification, health, organic, halal, or sustainability claims. If a fact is missing, omit it. Indonesian is primary; English is separate. The creativeBrief must describe a promotional poster layout: product hero placement, background, headline, offer/price treatment, CTA, and contact/social footer. Use the supplied Instagram handle and phone contact in the footer when present. The later image model must be able to turn it into an actual feed/story advertisement. Always make overlayText contain exact factual text, including product name, price, Instagram handle, and phone contact when supplied. Return JSON only, no markdown:
{
  "captionId": "Indonesian caption",
  "captionEn": "English caption",
  "hashtags": ["#relevant"],
  "altText": "Concise image alt text",
  "creativeBrief": { "angle": "provided angle", "mood": "", "composition": "detailed poster layout, not a catalog photo", "overlayText": "headline, price, CTA, and factual footer text" },
  "warnings": []
}
Keep captions factual, concise, and suitable for the requested format. Do not mention image generation.`;

export function parseCopyResult(text: string) {
  const candidate = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const value = JSON.parse(candidate) as Record<string, unknown>;
    const brief = value.creativeBrief;
    if (typeof value.captionId !== "string" || typeof value.captionEn !== "string" || !Array.isArray(value.hashtags) || typeof value.altText !== "string" || !brief || typeof brief !== "object" || !Array.isArray(value.warnings)) return null;
    const creativeBrief = brief as Record<string, unknown>;
    if (!["angle", "mood", "composition", "overlayText"].every((key) => typeof creativeBrief[key] === "string")) return null;
    return {
      captionId: value.captionId.trim(), captionEn: value.captionEn.trim(), altText: value.altText.trim(),
      hashtags: value.hashtags.filter((tag): tag is string => typeof tag === "string").slice(0, 12),
      creativeBrief: { angle: creativeBrief.angle, mood: creativeBrief.mood, composition: creativeBrief.composition, overlayText: creativeBrief.overlayText },
      warnings: value.warnings.filter((warning): warning is string => typeof warning === "string").slice(0, 12),
    };
  } catch {
    return null;
  }
}
