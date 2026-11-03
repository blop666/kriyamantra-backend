import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/http";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return jsonError("Authentication required", 401);

    const { data: business, error } = await supabase
      .from("businesses")
      .select("id, name, category, location, story, languages, tone, onboarding_completed_at")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (error) return jsonError("Could not load business profile", 500);

    return Response.json({ business });
  } catch (error) {
    console.error("Business profile lookup failed", error);
    return jsonError("Server configuration error", 500);
  }
}
