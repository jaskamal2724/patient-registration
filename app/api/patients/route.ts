import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("registered_at", { ascending: true });

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
    const { doctor_id, session_id, name, age, gender, phone, reason } = body;

    if (!name || !age || !gender || !phone || !reason) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!name.trim() || !reason.trim()) {
      return NextResponse.json({ error: "Name and reason cannot be empty" }, { status: 400 });
    }

    if (isNaN(+age) || +age < 1 || +age > 120) {
      return NextResponse.json({ error: "Enter a valid age (1-120)" }, { status: 400 });
    }

    if (phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit phone number" }, { status: 400 });
    }

    const supabase = createServerClient();
    let targetDoctorId = doctor_id;
    let targetSessionId = session_id;

    if (targetSessionId && !targetDoctorId) {
      const { data: sess } = await supabase
        .from("sessions")
        .select("doctor_id")
        .eq("id", targetSessionId)
        .single();
      if (sess) targetDoctorId = sess.doctor_id;
    }

    if (!targetDoctorId) {
      const { data: docList } = await supabase.from("doctors").select("id").limit(1);
      if (docList && docList.length > 0) {
        targetDoctorId = docList[0].id;
      } else {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
      }
    }

    // Check doctor's registration status in doctors table
    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select("id, registration")
      .eq("id", targetDoctorId)
      .single();

    if (docErr || !doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    if (!doctor.registration) {
      return NextResponse.json({ error: "Registration is currently closed" }, { status: 403 });
    }

    // Find or create session for doctor to satisfy foreign key constraint on patients.session_id
    if (!targetSessionId) {
      const today = new Date().toISOString().split("T")[0];
      const { data: existingSession } = await supabase
        .from("sessions")
        .select("id")
        .eq("doctor_id", targetDoctorId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        targetSessionId = existingSession.id;
      } else {
        const { data: newSession, error: createSessErr } = await supabase
          .from("sessions")
          .insert({
            doctor_id: targetDoctorId,
            date: today,
            is_open: true,
          })
          .select("id")
          .single();

        if (createSessErr || !newSession) {
          return NextResponse.json({ error: "Failed to initialize doctor session" }, { status: 500 });
        }
        targetSessionId = newSession.id;
      }
    }

    // Calculate token number for doctor
    const { count } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    const nextToken = (count || 0) + 1;

    const { data: patient, error: insertErr } = await supabase
      .from("patients")
      .insert({
        session_id: targetSessionId,
        token_number: nextToken,
        name: name.trim(),
        age: String(age),
        gender,
        phone: phone.replace(/\D/g, ""),
        reason: reason.trim(),
      })
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
