"use client";

import { Suspense } from "react";
import PatientRegistrationPortal from "../components/PatientRegistrationPortal";

export default function PatientRegistrationPage() {
  return (
    <Suspense fallback={null}>
      <PatientRegistrationPortal />
    </Suspense>
  );
}
