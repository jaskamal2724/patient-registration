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
    const { doctor_id, session_id, name, age, gender, phone, time_slot, reason } = body;

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
      .select("id, registration, session_date, patients_per_hour, auto_close_10am")
      .eq("id", targetDoctorId)
      .single();

    if (docErr || !doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    if (!doctor.registration) {
      return NextResponse.json({ error: "Registration is currently closed by the doctor" }, { status: 403 });
    }

    // Check 10:00 AM cutoff rule ONLY if doctor.auto_close_10am is true
    if (doctor.auto_close_10am && doctor.session_date) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      if (todayStr === doctor.session_date) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (currentMinutes >= 600) { // 10:00 AM cutoff
          return NextResponse.json(
            { error: `Registration closed at 10:00 AM for today's session (${doctor.session_date}).` },
            { status: 403 }
          );
        }
      } else if (todayStr > doctor.session_date) {
        return NextResponse.json(
          { error: `Registration for ${doctor.session_date} session is closed.` },
          { status: 403 }
        );
      }
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

    // Requirement 4: Prevent duplicate registration with the same phone number for the same session
    const cleanPhone = phone.replace(/\D/g, "");
    const { data: existingPatient } = await supabase
      .from("patients")
      .select("id, token_number, slot_token_number")
      .eq("session_id", targetSessionId)
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (existingPatient) {
      const tokenDisplay = existingPatient.slot_token_number || existingPatient.token_number;
      return NextResponse.json(
        { error: `This phone number (${cleanPhone}) is already registered for this session with Token #${tokenDisplay}. Duplicate registrations with the same phone number are not allowed.` },
        { status: 400 }
      );
    }

    // Calculate global token number for session
    const { count: globalCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("session_id", targetSessionId);

    const nextToken = (globalCount || 0) + 1;

    // Requirement 1: Check slot capacity based on doctor's patients_per_hour
    const capacity = doctor.patients_per_hour ?? 10;
    const { count: slotCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("session_id", targetSessionId)
      .eq("time_slot", time_slot.trim());

    if ((slotCount || 0) >= capacity) {
      return NextResponse.json(
        { error: `This time slot is full (maximum ${capacity} patients allowed per slot). Please select another time slot.` },
        { status: 400 }
      );
    }

    const slotTokenNumber = (slotCount || 0) + 1;

    const { data: patient, error: insertErr } = await supabase
      .from("patients")
      .insert({
        session_id: targetSessionId,
        token_number: nextToken,
        slot_token_number: slotTokenNumber,
        time_slot: time_slot.trim(),
        name: name.trim(),
        age: String(age),
        gender,
        phone: phone.replace(/\D/g, ""),
        reason: (reason || "").trim(),
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
