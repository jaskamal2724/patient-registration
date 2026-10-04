import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("start_time, end_time, delay_minutes");

    if (error) {
      return NextResponse.json(
        { error: "failed to get start and end time " },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { data },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
