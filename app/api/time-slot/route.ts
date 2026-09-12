import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("start_time, end_time");

    if (error) {
      return NextResponse.json(
        { error: "failed to get start and end time " },
        { status: 404 },
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
