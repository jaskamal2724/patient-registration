"use client";

import LogiquelAdCard from "./LogiquelAdCard";

export default function LogiquelFooter() {
  return (
    <footer className="w-full relative py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <LogiquelAdCard variant="landing" />
      </div>
    </footer>
  );
}
