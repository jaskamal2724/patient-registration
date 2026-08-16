"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDoctorProfile } from "@/lib/api";
import type { Doctor } from "@/lib/types";
import DoctorDashboard from "../components/DoctorDashboard";
import LoadingScreen from "../components/LoadingScreen";

export default function DoctorPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const doc = await fetchDoctorProfile();
      if (!doc) {
        router.replace("/?login=true");
        return;
      }
      setDoctor(doc);
      setChecking(false);
    })();
  }, [router]);

  if (checking || !doctor) return <LoadingScreen />;

  return <DoctorDashboard doctor={doctor} />;
}
