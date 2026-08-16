"use client";
import { Suspense } from "react";
import LandingPage from "./components/LandingPage";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-50">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LandingPage />
    </Suspense>
  );
}
