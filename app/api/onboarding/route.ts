import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError, readJson } from "@/lib/http";
import { parseOnboardingInput } from "@/lib/domain/onboarding";

export async function POST(request: Request) {
  const input = parseOnboardingInput(await readJson(request));
  if (!input) return jsonError("Invalid onboarding payload", 400);

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return jsonError("Authentication required", 401);

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .upsert(
        {
          owner_id: user.id,
          name: input.businessName,
          category: input.category,
          location: input.location,
          story: input.story,
          languages: input.languages,
          tone: input.tone,
          instagram_handle: input.instagramHandle,
          contact_phone: input.contactPhone,
          onboarding_completed_at: new Date().toISOString(),
        },
        { onConflict: "owner_id" },
      )
      .select("id, name, category, location, story, languages, tone, instagram_handle, contact_phone, onboarding_completed_at")
      .single();

    if (businessError) return jsonError("Could not save business profile", 500);

    const { error: consentError } = await supabase.from("consents").upsert(
      {
        user_id: user.id,
        consent_type: "ai_data_processing",
        policy_version: input.consentPolicyVersion,
      },
      { onConflict: "user_id,consent_type,policy_version" },
    );

    if (consentError) return jsonError("Could not save consent", 500);

    return Response.json({ business }, { status: 201 });
  } catch (error) {
    console.error("Onboarding failed", error);
    return jsonError("Server configuration error", 500);
  }
}
