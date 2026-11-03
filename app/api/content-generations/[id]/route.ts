import { and, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { contentGenerations, contentOutputs } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Authentication required", 401);
    const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
    if (!business) return jsonError("Business profile required", 400);

    const { id } = await params;
    const db = getDb();
    const [generation] = await db.select().from(contentGenerations).where(and(eq(contentGenerations.id, id), eq(contentGenerations.businessId, business.id))).limit(1);
    if (!generation) return jsonError("Generation not found", 404);
    const outputs = await db.select().from(contentOutputs).where(eq(contentOutputs.generationId, generation.id));
    return Response.json({ generation, outputs });
  } catch (error) {
    console.error("Content generation lookup failed", error);
    return jsonError("Could not load content generation", 500);
  }
}
