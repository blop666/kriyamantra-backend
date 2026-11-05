import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/http";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return jsonError("Authentication required", 401);

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  return Response.json({
    user: {
      userId: user.id,
      email: user.email ?? "",
      role: "CRAFTER",
      businessId: business?.id ?? null,
      businessName: business?.name,
    },
  });
}
