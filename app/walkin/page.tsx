"use client";
import { Suspense } from "react";
import WalkinPatientPortal from "../components/WalkinPatientPortal";

export default function WalkinPage() {
  return (
    <Suspense fallback={null}>
      <WalkinPatientPortal />
    </Suspense>
  );
}
