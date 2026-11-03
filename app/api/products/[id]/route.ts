import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/http";
import { parseProductInput } from "@/lib/domain/products";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required", 401);
  const input = parseProductInput(await request.json().catch(() => null));
  if (!input) return jsonError("Invalid product data", 400);
  const { id } = await params;
  const { data, error } = await supabase.from("products").update(input).eq("id", id).select("id, name, description, materials, price, image_path, created_at, updated_at").maybeSingle();
  if (error) return jsonError("Could not update product", 500);
  if (!data) return jsonError("Product not found", 404);
  return Response.json({ product: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required", 401);
  const { id } = await params;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return jsonError("Could not delete product", 500);
  return new Response(null, { status: 204 });
}
