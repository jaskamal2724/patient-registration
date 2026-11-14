"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDoctorProfile, SESSION_EXPIRED_EVENT } from "@/lib/api";
import { createBrowserClient } from "@/lib/supabase";
import type { Doctor } from "@/lib/types";
import DoctorDashboard from "../components/DoctorDashboard";
import LoadingScreen from "../components/LoadingScreen";

const supabase = createBrowserClient();

export default function DoctorPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    // Check doctor profile on initial mount
    (async () => {
      const doc = await fetchDoctorProfile();
      if (!doc && !cancelled) {
        router.replace("/?login=true&expired=true");
        return;
      }
      if (!cancelled) {
        setDoctor(doc);
        setChecking(false);
      }
    })();

    // Listen for realtime Supabase auth state changes (e.g. signed out on this device or token refresh failed)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
        router.replace("/?login=true&expired=true");
      }
    });

    // Listen for custom 401 session-expired event dispatched by API client
    const handleExpired = () => {
      router.replace("/?login=true&expired=true");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, [router]);

  if (checking || !doctor) return <LoadingScreen />;

  return <DoctorDashboard doctor={doctor} />;
}
