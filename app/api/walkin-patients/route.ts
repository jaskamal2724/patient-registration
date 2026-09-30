import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctor_id");

    let query = supabase
      .from("walkin_patients")
      .select("*")
      .order("token_number", { ascending: true });

    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ walkin_patients: data || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { doctor_id, name, age, gender, phone, city_village, reason } = body;

    if (!name || !age || !gender || !phone) {
      return NextResponse.json({ error: "Name, age, gender, and phone number are required" }, { status: 400 });
    }

    if (!name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    if (isNaN(+age) || +age < 1 || +age > 120) {
      return NextResponse.json({ error: "Enter a valid age (1-120)" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit phone number" }, { status: 400 });
    }

    const supabase = createServerClient();
    let targetDoctorId = doctor_id;

    if (!targetDoctorId) {
      const { data: docList } = await supabase.from("doctors").select("id").limit(1);
      if (docList && docList.length > 0) {
        targetDoctorId = docList[0].id;
      } else {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
      }
    }

    // Direct check: Doctor's registration status
    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select("id, registration")
      .eq("id", targetDoctorId)
      .single();

    if (docErr || !doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    if (!doctor.registration) {
      return NextResponse.json({ error: "Registration is currently closed by the doctor" }, { status: 403 });
    }

    // Prevent duplicate registration with the same phone number for walkin patients
    const { data: existingWalkin } = await supabase
      .from("walkin_patients")
      .select("id, token_number, walkin_token_display")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (existingWalkin) {
      return NextResponse.json(
        {
          error: `This phone number (${cleanPhone}) is already registered for Walk-in with Token ${existingWalkin.walkin_token_display || existingWalkin.token_number}.`,
          patient: existingWalkin,
        },
        { status: 400 }
      );
    }

    // Calculate sequential walk-in token number
    const { count: walkinCount } = await supabase
      .from("walkin_patients")
      .select("*", { count: "exact", head: true });

    const nextToken = (walkinCount || 0) + 1;
    const walkinTokenDisplay = `W-${nextToken}`;

    const insertPayload: Record<string, unknown> = {
      doctor_id: targetDoctorId,
      token_number: nextToken,
      walkin_token_display: walkinTokenDisplay,
      name: name.trim(),
      age: String(age),
      gender,
      phone: cleanPhone,
      city_village: (city_village || "").trim(),
      reason: (reason || "").trim(),
      status: "waiting",
    };

    const { data: walkinPatient, error: insertErr } = await supabase
      .from("walkin_patients")
      .insert(insertPayload)
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ patient: walkinPatient }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
