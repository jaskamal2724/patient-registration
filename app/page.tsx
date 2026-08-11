"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDoctorProfile } from "@/lib/api";
import LandingPage from "./components/LandingPage";
import LoadingScreen from "./components/LoadingScreen";

export default function Home() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const doctor = await fetchDoctorProfile();
      if (doctor) {
        router.replace("/doctor");
        return;
      }
      setChecking(false);
    })();
  }, [router]);

  if (checking) return <LoadingScreen />;

  return <LandingPage />;
}
