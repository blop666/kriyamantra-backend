import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/http";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required", 401);

  const { id } = await params;
  const { data: product, error: productError } = await supabase.from("products").select("id, image_path").eq("id", id).maybeSingle();
  if (productError) return jsonError("Could not load product", 500);
  if (!product) return jsonError("Product not found", 404);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("Image file is required", 400);
  if (!allowedTypes.has(file.type)) return jsonError("Only JPEG, PNG, or WebP images are allowed", 400);
  if (file.size > maxBytes) return jsonError("Image must be 5 MB or smaller", 400);

  const path = `${user.id}/${id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return jsonError("Could not upload image", 500);

  const { error: updateError } = await supabase.from("products").update({ image_path: path }).eq("id", id);
  if (updateError) {
    await supabase.storage.from("product-images").remove([path]);
    return jsonError("Could not save image reference", 500);
  }

  if (product.image_path) await supabase.storage.from("product-images").remove([product.image_path]);
  return Response.json({ imagePath: path });
}
