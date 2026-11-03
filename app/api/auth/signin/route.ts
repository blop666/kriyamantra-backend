import { jsonError, readJson } from "@/lib/http";
import { parseAuthInput } from "@/lib/domain/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const input = parseAuthInput(await readJson(request));
  if (!input) return jsonError("Email or password is invalid", 400);

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword(input);

    if (error) return jsonError("Invalid email or password", 401, error.code);

    return Response.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error("Signin failed", error);
    return jsonError("Server configuration error", 500);
  }
}
