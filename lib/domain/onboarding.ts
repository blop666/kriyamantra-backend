export type OnboardingInput = {
  businessName: string;
  category: string;
  location?: string;
  story?: string;
  languages?: string[];
  tone?: string;
  instagramHandle: string;
  contactPhone: string;
  consentPolicyVersion: string;
};

export function parseOnboardingInput(value: unknown): OnboardingInput | null {
  if (!value || typeof value !== "object") return null;

  const input = value as Record<string, unknown>;
  const businessName = text(input.businessName, 2, 120);
  const category = text(input.category, 2, 120);
  const consentPolicyVersion = text(input.consentPolicyVersion, 1, 40);
  const instagramHandle = text(input.instagramHandle, 2, 120);
  const contactPhone = text(input.contactPhone, 5, 40);

  if (!businessName || !category || !consentPolicyVersion || !instagramHandle || !contactPhone) return null;

  const languages = Array.isArray(input.languages)
    ? input.languages.filter((language): language is string => typeof language === "string")
    : ["id"];

  return {
    businessName,
    category,
    location: optionalText(input.location, 120),
    story: optionalText(input.story, 2000),
    languages: languages.length > 0 ? languages.slice(0, 3) : ["id"],
    tone: optionalText(input.tone, 120),
    instagramHandle,
    contactPhone,
    consentPolicyVersion,
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
