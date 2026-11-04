"use client";

import { Suspense } from "react";
import PatientRegistrationPortal from "@/app/components/PatientRegistrationPortal";

export default function PatientRegisterRoutePage() {
  return (
    <Suspense fallback={null}>
      <PatientRegistrationPortal />
    </Suspense>
  );
}
