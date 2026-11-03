import { jsonError, readJson } from "@/lib/http";
import { parseAuthInput } from "@/lib/domain/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const input = parseAuthInput(await readJson(request));
  if (!input) return jsonError("Email or password is invalid", 400);

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp(input);

    if (error) return jsonError("Could not create account", error.status ?? 400, error.code);

    return Response.json(
      { user: data.user, session: data.session, confirmationRequired: !data.session },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup failed", error);
    return jsonError("Server configuration error", 500);
  }
}
