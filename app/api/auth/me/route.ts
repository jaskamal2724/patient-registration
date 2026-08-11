import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("id, name, email, registration, created_at")
    .eq("id", user.id)
    .single();

  if (doctorError || !doctor) {
    return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
  }

  return NextResponse.json({ doctor });
}
