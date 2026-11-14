import { createBrowserClient } from "@/lib/supabase";
import type { Doctor } from "./types";

const supabase = createBrowserClient();

/**
 * Broadcast doctor state updates (e.g., short break, delay, registration toggle)
 * instantly across all tabs, windows, and connected devices without requiring a page refresh.
 */
export function notifyDoctorUpdated(doctor: Doctor) {
  if (typeof window === "undefined") return;

  // 1. Cross-tab instant BroadcastChannel (0ms latency within the same browser)
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("doccare-live-sync");
      bc.postMessage({ type: "DOCTOR_UPDATED", doctor });
      bc.close();
    }
  } catch {
    // Ignore errors in environments where BroadcastChannel is restricted
  }

  // 2. LocalStorage event (instant 0ms cross-tab fallback for all browsers)
  try {
    localStorage.setItem(
      "doccare_doctor_sync",
      JSON.stringify({ time: Date.now(), doctor })
    );
  } catch {
    // Ignore storage quota/security errors
  }

  // 3. Supabase Realtime Broadcast (instant sub-100ms delivery across all different devices)
  try {
    const channel = supabase.channel("doccare-global-sync");
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: "doctor_updated",
          payload: doctor,
        }).catch(() => {});
      }
    });
  } catch {
    // Ignore broadcast errors
  }
}

