"use client";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-gradient-to-b from-[#EBF4FF] via-[#F8FAFF] to-[#D5E6FF] overflow-hidden select-none animate-fade-in">
      {/* Top Left Background Curve */}
      <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none -translate-x-12 -translate-y-16 opacity-60">
        <svg viewBox="0 0 300 300" className="w-full h-full fill-[#BEDBFF]">
          <path d="M0,0 L300,0 C240,80 180,140 100,160 C30,175 0,260 0,300 Z" />
        </svg>
      </div>

      {/* Bottom Right Background Curve */}
      <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none translate-x-12 translate-y-16 opacity-70">
        <svg viewBox="0 0 350 350" className="w-full h-full fill-[#8EC5FF]">
          <path d="M350,350 L0,350 C80,310 140,240 190,160 C250,60 310,20 350,0 Z" />
        </svg>

        {/* Heart ECG Pulse outline icon in bottom right */}
        <div className="absolute bottom-10 right-10 z-10 text-white/90 drop-shadow-md">
          <svg viewBox="0 0 64 64" className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M32 54C32 54 8 36 8 20C8 13.3726 13.3726 8 20 8C25.5 8 29.5 11 32 15C34.5 11 38.5 8 44 8C50.6274 8 56 13.3726 56 20C56 36 32 54 32 54Z" />
            <path d="M14 26H24L27 18L33 34L37 23L40 26H50" stroke="#FFFFFF" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* Top Spacer */}
      <div className="h-16" />

      {/* Main Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm mx-auto my-auto">
        {/* Stethoscope Logo Emblem */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 mb-6 drop-shadow-lg animate-float">
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
            {/* Stethoscope Arms */}
            <path
              d="M38 34C38 34 38 68 60 68C82 68 82 34 82 34"
              stroke="#0066FF"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Earpieces */}
            <circle cx="38" cy="34" r="7" fill="#0066FF" />
            <circle cx="82" cy="34" r="7" fill="#0066FF" />
            
            {/* Tubing loop down */}
            <path
              d="M60 68V78C60 92 76 96 82 86C88 76 86 62 86 62"
              stroke="#0066FF"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Chestpiece */}
            <circle cx="86" cy="56" r="10" fill="#0066FF" />
            <circle cx="86" cy="56" r="4" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-none mb-2">
          <span className="text-[#0B1938]">Doc</span>
          <span className="text-[#0066FF]">Care</span>
        </h1>

        {/* Tagline */}
        <p className="font-body text-slate-500 font-medium text-sm sm:text-base tracking-wide mb-12">
          Care, just a tap away.
        </p>

        {/* 2-Second Animated Progress Bar */}
        <div className="w-56 h-1.5 bg-blue-100/90 rounded-full overflow-hidden shadow-inner mb-3">
          <div className="h-full bg-[#0066FF] rounded-full animate-progress-fill" />
        </div>

        {/* Loading Text */}
        <p className="font-body text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase">
          LOADING...
        </p>
      </div>

      {/* Bottom Spacer */}
      <div className="h-16" />

      {/* Inline styles for 2s progress bar animation */}
      <style jsx>{`
        @keyframes progressFill {
          0% { width: 0%; }
          50% { width: 65%; }
          100% { width: 100%; }
        }
        .animate-progress-fill {
          animation: progressFill 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}
