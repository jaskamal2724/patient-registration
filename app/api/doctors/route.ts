import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const openOnly = searchParams.get("open") === "true";

    let query = supabase.from("doctors").select("*");

    if (openOnly) {
      query = query.eq("registration", true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const doctor = data && data.length > 0 ? data[0] : null;

    if (doctor) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const sessionDateStr = doctor.session_date ? String(doctor.session_date).split("T")[0] : todayStr;
      
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const isPast10AM = currentMinutes >= 600; // 10:00 AM

      const isExpired = (sessionDateStr === todayStr && isPast10AM) || (todayStr > sessionDateStr);

      if (isExpired && doctor.registration) {
        await supabase
          .from("doctors")
          .update({ registration: false })
          .eq("id", doctor.id);

        doctor.registration = false;
      }
    }

    return NextResponse.json({
      doctors: data || [],
      doctor,
      open: doctor ? Boolean(doctor.registration) : false,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
