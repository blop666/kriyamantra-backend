export type ProductInput = {
  name: string;
  description?: string;
  materials?: string;
  price?: number;
};

export function parseProductInput(value: unknown): ProductInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const name = text(input.name, 2, 160);
  if (!name) return null;
  const price = input.price === undefined || input.price === null || input.price === "" ? undefined : Number(input.price);
  if (price !== undefined && (!Number.isFinite(price) || price < 0 || price > 1_000_000_000)) return null;
  return {
    name,
    description: optionalText(input.description, 3000),
    materials: optionalText(input.materials, 500),
    price,
  };
}

function text(value: unknown, min: number, max: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length >= min && normalized.length <= max ? normalized : null;
}

function optionalText(value: unknown, max: number) {
  return value === undefined || value === null ? undefined : text(value, 1, max) ?? undefined;
}
