import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/http";
import { parseProductInput } from "@/lib/domain/products";

async function getBusiness(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { business: null, error: userError };
  const { data, error } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  return { business: data, error };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { business, error: businessError } = await getBusiness(supabase);
  if (businessError) return jsonError("Could not load business profile", 500, supabaseErrorDetails(businessError));
  if (!business) return jsonError("Authentication or business profile required", 401);
  const { data, error } = await supabase.from("products").select("id, name, description, materials, price, image_path, created_at, updated_at").eq("business_id", business.id).order("created_at", { ascending: false });
  if (error) return jsonError("Could not load products", 500, supabaseErrorDetails(error));
  return Response.json({ products: data });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { business, error: businessError } = await getBusiness(supabase);
  if (businessError) return jsonError("Could not load business profile", 500, supabaseErrorDetails(businessError));
  if (!business) return jsonError("Authentication or business profile required", 401);
  const input = parseProductInput(await request.json().catch(() => null));
  if (!input) return jsonError("Invalid product data", 400);
  const { data, error } = await supabase.from("products").insert({ business_id: business.id, ...input }).select("id, name, description, materials, price, image_path, created_at, updated_at").single();
  if (error) return jsonError("Could not create product", 500, supabaseErrorDetails(error));
  return Response.json({ product: data }, { status: 201 });
}

function supabaseErrorDetails(error: { code?: string; message?: string; details?: string; hint?: string }) {
  return {
    code: error.code ?? "unknown",
    message: error.message ?? "Unknown Supabase error",
    ...(error.details ? { details: error.details } : {}),
    ...(error.hint ? { hint: error.hint } : {}),
  };
}
