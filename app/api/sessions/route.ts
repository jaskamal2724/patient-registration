import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctor_id");
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    let query = supabase.from("sessions").select("*");

    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }

    query = query.eq("date", date).order("created_at", { ascending: false }).limit(1);

    const { data, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let doctorName: string | null = null;
    if (data?.doctor_id) {
      const { data: doc } = await supabase
        .from("doctors")
        .select("name")
        .eq("id", data.doctor_id)
        .single();
      doctorName = doc?.name ?? null;
    }

    return NextResponse.json({ session: data || null, doctor_name: doctorName });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { doctor_id, date, start_time, end_time, max_patients, message } = body;

    if (!doctor_id || !date) {
      return NextResponse.json({ error: "doctor_id and date are required" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        doctor_id,
        date,
        start_time: start_time || "09:00",
        end_time: end_time || "13:00",
        max_patients: max_patients || 30,
        message: message || "Morning OPD session",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
