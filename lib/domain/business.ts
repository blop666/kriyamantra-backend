import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOwnedBusiness() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { user: null, business: null, error: "Authentication required" as const };
  const { data: business, error } = await supabase.from("businesses").select("id, timezone").eq("owner_id", user.id).maybeSingle();
  if (error) return { user, business: null, error: "Could not load business profile" as const };
  return { user, business, error: null };
}
