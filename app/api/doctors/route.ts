import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const openOnly = searchParams.get("open") === "true";

    let query = supabase.from("doctors").select("id, name, email, registration, created_at");

    if (openOnly) {
      query = query.eq("registration", true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const doctor = data && data.length > 0 ? data[0] : null;

    return NextResponse.json({
      doctors: data || [],
      doctor,
      open: doctor ? Boolean(doctor.registration) : false,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
