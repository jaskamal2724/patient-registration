import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}
