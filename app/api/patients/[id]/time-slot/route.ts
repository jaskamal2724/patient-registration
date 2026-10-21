import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { time_slot, resetStatus } = body;

    if (!time_slot || typeof time_slot !== "string" || !time_slot.trim()) {
      return NextResponse.json(
        { error: "A valid time slot is required" },
        { status: 400 }
      );
    }

    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    // Fetch existing patient
    const { data: patient, error: fetchErr } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const trimmedSlot = time_slot.trim();

    // If time slot is changed, calculate next sequential slot_token_number for that slot
    let nextSlotToken = patient.slot_token_number;
    if (patient.time_slot !== trimmedSlot) {
      const { data: existingInSlot } = await supabase
        .from("patients")
        .select("slot_token_number")
        .eq("time_slot", trimmedSlot);

      if (existingInSlot && existingInSlot.length > 0) {
        const maxSlotToken = Math.max(
          ...existingInSlot.map((p) => p.slot_token_number || 0)
        );
        nextSlotToken = maxSlotToken + 1;
      } else {
        nextSlotToken = 1;
      }
    }

    const updates: Record<string, unknown> = {
      time_slot: trimmedSlot,
      slot_token_number: nextSlotToken,
    };

    // If patient was skipped or resetStatus was requested, move status back to waiting
    if (patient.status === "skipped" || resetStatus) {
      updates.status = "waiting";
    }

    const { data: updatedPatient, error: updateErr } = await supabase
      .from("patients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ patient: updatedPatient });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
