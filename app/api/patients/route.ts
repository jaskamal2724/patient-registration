import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("token_number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ patients: data || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { doctor_id, name, age, gender, phone, time_slot, reason } = body;

    if (!name || !age || !gender || !phone || !time_slot) {
      return NextResponse.json({ error: "Name, age, gender, phone, and time slot are required" }, { status: 400 });
    }

    if (!name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    if (!time_slot.trim()) {
      return NextResponse.json({ error: "Please select a valid time slot" }, { status: 400 });
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
      .select("id, registration, patients_per_hour")
      .eq("id", targetDoctorId)
      .single();

    if (docErr || !doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    if (!doctor.registration) {
      return NextResponse.json({ error: "Registration is currently closed by the doctor" }, { status: 403 });
    }

    // Calculate sequential token number
    const { count: globalCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    const nextToken = (globalCount || 0) + 1;

    // Check slot capacity based on doctor's patients_per_hour
    const capacity = doctor.patients_per_hour ?? 10;
    const { count: slotCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("time_slot", time_slot.trim());

    if ((slotCount || 0) >= capacity) {
      return NextResponse.json(
        { error: `This time slot is full (maximum ${capacity} patients allowed per slot). Please select another time slot.` },
        { status: 400 }
      );
    }

    const slotTokenNumber = (slotCount || 0) + 1;

    // Insert patient directly without session_id
    const insertPayload: Record<string, unknown> = {
      token_number: nextToken,
      slot_token_number: slotTokenNumber,
      time_slot: time_slot.trim(),
      name: name.trim(),
      age: String(age),
      gender,
      phone: cleanPhone,
      reason: (reason || "").trim(),
      status: "waiting",
    };

    const { data: patient, error: insertErr } = await supabase
      .from("patients")
      .insert(insertPayload)
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ patient }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
