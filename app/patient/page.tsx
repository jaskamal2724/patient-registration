"use client";
import { Suspense } from "react";
import PatientPortal from "../components/PatientPortal";

export default function PatientPage() {
  return (
    <Suspense fallback={null}>
      <PatientPortal />
    </Suspense>
  );
}
