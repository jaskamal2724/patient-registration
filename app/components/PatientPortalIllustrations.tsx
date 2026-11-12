"use client";

export function DoctorAvatarSVG({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <circle cx="50" cy="50" r="48" fill="#DCE9FE" />
        {/* Hair */}
        <path
          d="M32 40C32 26 40 18 50 18C60 18 68 26 68 40C68 42 66 45 66 45C66 45 62 36 50 36C38 36 34 45 34 45C34 45 32 42 32 40Z"
          fill="#1E293B"
        />
        {/* Face */}
        <path
          d="M36 42C36 42 38 58 50 58C62 58 64 42 64 42C64 36 60 32 50 32C40 32 36 36 36 42Z"
          fill="#FDBA74"
        />
        {/* Ears */}
        <circle cx="34" cy="44" r="4" fill="#FDBA74" />
        <circle cx="66" cy="44" r="4" fill="#FDBA74" />
        {/* Eyes & Eyebrows */}
        <path d="M41 40Q44 38 47 40" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <path d="M53 40Q56 38 59 40" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="44" r="1.5" fill="#1E293B" />
        <circle cx="56" cy="44" r="1.5" fill="#1E293B" />
        {/* Nose */}
        <path d="M50 44V48" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
        {/* Smile */}
        <path d="M45 52Q50 55 55 52" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
        {/* Collar & Tie */}
        <path d="M42 64L50 82L58 64V98H42V64Z" fill="#2563EB" />
        <path d="M46 64L50 78L54 64H46Z" fill="#1D4ED8" />
        {/* Coat */}
        <path d="M22 80C22 66 32 62 42 64L50 90L58 64C68 62 78 66 78 80V98H22V80Z" fill="#FFFFFF" />
        {/* Stethoscope around neck */}
        <path
          d="M34 62C34 72 40 76 46 76C47 76 48 78 48 80C48 82 46.5 83 45 83C43.5 83 42 81.5 42 80"
          stroke="#475569"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M66 62C66 72 60 76 54 76"
          stroke="#475569"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="45" cy="83" r="3.5" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function RegisterIllustrationSVG({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 160 140" className="w-full h-full" fill="none">
        {/* Background Soft Blob */}
        <path
          d="M140 70C140 100 110 130 75 130C40 130 15 105 15 70C15 35 45 10 80 10C115 10 140 40 140 70Z"
          fill="#EEF5FF"
        />
        {/* Yellow Sparks top right */}
        <path d="M125 15L132 8" stroke="#FFC629" strokeWidth="3" strokeLinecap="round" />
        <path d="M135 22L145 20" stroke="#FFC629" strokeWidth="3" strokeLinecap="round" />
        <path d="M132 32L142 37" stroke="#FFC629" strokeWidth="3" strokeLinecap="round" />

        {/* Clipboard */}
        <g transform="translate(30, 20) rotate(-6)">
          <rect x="0" y="0" width="70" height="90" rx="12" fill="#E2E8F0" />
          <rect x="6" y="8" width="58" height="74" rx="8" fill="#FFFFFF" />
          {/* Clipboard Top Clip */}
          <rect x="22" y="-5" width="26" height="12" rx="4" fill="#3B82F6" />
          <circle cx="35" cy="1" r="3" fill="#FFFFFF" />
          {/* Document Content lines */}
          <rect x="14" y="24" width="18" height="18" rx="9" fill="#DBEAFE" />
          <circle cx="23" cy="30" r="4" fill="#2563EB" />
          <path d="M17 38C17 35 20 34 23 34C26 34 29 35 29 38" fill="#2563EB" />
          <rect x="36" y="26" width="22" height="4" rx="2" fill="#94A3B8" />
          <rect x="36" y="34" width="16" height="3" rx="1.5" fill="#CBD5E1" />
          <rect x="14" y="48" width="42" height="3" rx="1.5" fill="#CBD5E1" />
          <rect x="14" y="56" width="36" height="3" rx="1.5" fill="#CBD5E1" />
          <rect x="14" y="64" width="40" height="3" rx="1.5" fill="#CBD5E1" />
        </g>

        {/* Calendar Card Overlay */}
        <g transform="translate(75, 45)">
          <rect x="0" y="0" width="60" height="55" rx="10" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="2" className="drop-shadow-md" />
          <rect x="0" y="0" width="60" height="16" rx="8" fill="#3B82F6" />
          {/* Binder Rings */}
          <rect x="12" y="-4" width="4" height="8" rx="2" fill="#1E40AF" />
          <rect x="44" y="-4" width="4" height="8" rx="2" fill="#1E40AF" />
          {/* Calendar Grid Dots */}
          <rect x="10" y="22" width="7" height="7" rx="2" fill="#93C5FD" />
          <rect x="21" y="22" width="7" height="7" rx="2" fill="#93C5FD" />
          <rect x="32" y="22" width="7" height="7" rx="2" fill="#93C5FD" />
          <rect x="43" y="22" width="7" height="7" rx="2" fill="#93C5FD" />
          <rect x="10" y="33" width="7" height="7" rx="2" fill="#93C5FD" />
          <rect x="21" y="33" width="7" height="7" rx="2" fill="#93C5FD" />
          <rect x="32" y="33" width="7" height="7" rx="2" fill="#93C5FD" />
          {/* Checkmark Badge */}
          <circle cx="50" cy="45" r="12" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M44 45L48 49L56 41" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

export function AppointmentsFullIllustrationSVG({ className = "w-44 h-36" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 mx-auto ${className}`}>
      <svg viewBox="0 0 180 140" className="w-full h-full" fill="none">
        {/* Soft Background Blob */}
        <ellipse cx="90" cy="70" rx="75" ry="55" fill="#EEF4FF" />

        {/* Yellow Spark Accents top right */}
        <path d="M140 20L148 12" stroke="#FFC629" strokeWidth="3" strokeLinecap="round" />
        <path d="M152 28L162 26" stroke="#FFC629" strokeWidth="3" strokeLinecap="round" />
        <path d="M148 38L158 43" stroke="#FFC629" strokeWidth="3" strokeLinecap="round" />

        {/* Blue Calendar Card */}
        <g transform="translate(48, 25)">
          <rect x="0" y="0" width="84" height="76" rx="14" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="2.5" filter="drop-shadow(0 12px 20px rgba(37, 99, 235, 0.12))" />
          {/* Blue Header Bar */}
          <rect x="0" y="0" width="84" height="24" rx="12" fill="#3B82F6" />
          {/* Binder Rings */}
          <rect x="18" y="-6" width="6" height="12" rx="3" fill="#1D4ED8" />
          <rect x="60" y="-6" width="6" height="12" rx="3" fill="#1D4ED8" />
          {/* Grid Squares */}
          <rect x="14" y="32" width="12" height="10" rx="3" fill="#BFDBFE" />
          <rect x="30" y="32" width="12" height="10" rx="3" fill="#BFDBFE" />
          <rect x="46" y="32" width="12" height="10" rx="3" fill="#BFDBFE" />
          <rect x="62" y="32" width="12" height="10" rx="3" fill="#BFDBFE" />
          <rect x="14" y="48" width="12" height="10" rx="3" fill="#BFDBFE" />
          <rect x="30" y="48" width="12" height="10" rx="3" fill="#BFDBFE" />

          {/* Big Red Circle Badge with X */}
          <g transform="translate(56, 42)">
            <circle cx="18" cy="18" r="18" fill="#FF4D4D" stroke="#FFFFFF" strokeWidth="3" filter="drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))" />
            <path d="M12 12L24 24" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M24 12L12 24" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function BookAppointmentIconSVG({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 bg-[#FEEFAD] rounded-2xl border border-amber-200/60 ${className}`}>
      <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
        {/* Calendar Body */}
        <rect x="6" y="8" width="28" height="26" rx="6" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
        <rect x="6" y="8" width="28" height="8" rx="4" fill="#2563EB" />
        {/* Binder Pins */}
        <rect x="12" y="5" width="2.5" height="5" rx="1.25" fill="#1D4ED8" />
        <rect x="25.5" y="5" width="2.5" height="5" rx="1.25" fill="#1D4ED8" />
        {/* Grid dots */}
        <rect x="10" y="20" width="4" height="4" rx="1" fill="#93C5FD" />
        <rect x="17" y="20" width="4" height="4" rx="1" fill="#93C5FD" />
        {/* Yellow Plus Badge */}
        <circle cx="28" cy="27" r="7" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M28 23.5V30.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M24.5 27H31.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function TicketBadgeIconSVG({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
        <rect x="2" y="6" width="32" height="24" rx="7" fill="#3B82F6" />
        {/* Ticket Cuts */}
        <circle cx="2" cy="18" r="4" fill="#EEF4FF" />
        <circle cx="34" cy="18" r="4" fill="#EEF4FF" />
        {/* Hash symbol */}
        <path d="M14 12L12 24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 12L20 24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 15H24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 21H23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function WalkInIconSVG({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 bg-[#FEF0C7] rounded-full border border-amber-200 ${className}`}>
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="4" r="2" fill="currentColor" stroke="none" />
        <path d="M10 20l1-5 2-1 2 5" />
        <path d="M14 11l-3 4-2-2" />
        <path d="M8 12l4-2 3 1" />
      </svg>
    </div>
  );
}

export function BookedSlotCalendarSVG({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 68 64" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="bookedCalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A75F5" />
            <stop offset="100%" stopColor="#1252D4" />
          </linearGradient>
        </defs>
        {/* Yellow Radiant Sparks at Top-Right */}
        <line x1="51" y1="8" x2="54" y2="3" stroke="#F5B716" strokeWidth="3" strokeLinecap="round" />
        <line x1="57" y1="12" x2="63" y2="9" stroke="#F5B716" strokeWidth="3" strokeLinecap="round" />
        <line x1="47" y1="5" x2="48" y2="1" stroke="#F5B716" strokeWidth="2.8" strokeLinecap="round" />

        {/* Calendar Body */}
        <rect x="6" y="9" width="46" height="42" rx="12" fill="url(#bookedCalGrad)" />

        {/* Binder Loops at Top */}
        <rect x="15" y="5" width="5" height="9" rx="2.5" fill="#0C2556" />
        <rect x="33" y="5" width="5" height="9" rx="2.5" fill="#0C2556" />

        {/* Calendar Grid Days */}
        <rect x="12" y="21" width="6" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="22" y="21" width="6" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="32" y="21" width="6" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="12" y="30" width="6" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="22" y="30" width="6" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="32" y="30" width="6" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="12" y="39" width="6" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="22" y="39" width="6" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />

        {/* Clock Overlapping Bottom-Right */}
        <circle cx="43" cy="41" r="13" fill="#FFFFFF" stroke="#1D68F3" strokeWidth="3.2" />
        <circle cx="43" cy="41" r="1.6" fill="#1D68F3" />
        {/* Hour Hand pointing to ~9-10 */}
        <line x1="43" y1="41" x2="38.5" y2="38" stroke="#1D68F3" strokeWidth="2.4" strokeLinecap="round" />
        {/* Minute Hand pointing to 12 */}
        <line x1="43" y1="41" x2="43" y2="33.5" stroke="#1D68F3" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function YellowSmileSwooshSVG({ className = "w-36 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 14" className={className} fill="none">
      <path
        d="M 6 3.5 C 55 13.5, 115 13.5, 164 3.5"
        stroke="#F5B716"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GlowingBulbSVG({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        {/* Radiant rays */}
        <line x1="12" y1="9" x2="7" y2="5" stroke="#F5B716" strokeWidth="3" strokeLinecap="round" />
        <line x1="8" y1="18" x2="2" y2="18" stroke="#F5B716" strokeWidth="3" strokeLinecap="round" />
        <line x1="24" y1="6" x2="24" y2="1.5" stroke="#F5B716" strokeWidth="3" strokeLinecap="round" />
        <line x1="36" y1="9" x2="41" y2="5" stroke="#F5B716" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="18" x2="46" y2="18" stroke="#F5B716" strokeWidth="3" strokeLinecap="round" />

        {/* Glass Bulb */}
        <path
          d="M16 26 C12 21 12 14 16 9 C20 4 28 4 32 9 C36 14 36 21 32 26 C30 28.5 29 31 29 33.5 H19 C19 31 18 28.5 16 26 Z"
          fill="#FDE047"
          stroke="#0F172A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Filament */}
        <path
          d="M21 24.5 V17.5 C21 15.5 22.5 14 24 14 C25.5 14 27 15.5 27 17.5 V24.5"
          stroke="#EA580C"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Blue Screw Base */}
        <rect x="18" y="34" width="12" height="3" rx="1.2" fill="#1D68F3" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="19.5" y="37.5" width="9" height="3" rx="1.2" fill="#1D68F3" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="21" y="41" width="6" height="2.5" rx="1.2" fill="#0F172A" />
      </svg>
    </div>
  );
}

export function OpenMapFoldedSVG({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
        {/* Folded Map Panels */}
        <path d="M4 19 L11 16 V27 L4 29 Z" fill="#DBEAFE" stroke="#1E60E8" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M11 16 L18 19 V30 L11 27 Z" fill="#EFF6FF" stroke="#1E60E8" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M18 19 L25 16 V27 L18 30 Z" fill="#DBEAFE" stroke="#1E60E8" strokeWidth="1.8" strokeLinejoin="round" />
        {/* Pin centered above */}
        <path
          d="M14.5 4 C11.5 4 9 6.5 9 9.5 C9 13.5 14.5 19 14.5 19 C14.5 19 20 13.5 20 9.5 C20 6.5 17.5 4 14.5 4 Z"
          fill="#1E60E8"
        />
        <circle cx="14.5" cy="9.5" r="2.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function SupportHeadsetSVG({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 44 44" className="w-full h-full" fill="none">
        {/* Radiant yellow sparks at top right */}
        <line x1="28" y1="7" x2="32" y2="3" stroke="#F5B716" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="33" y1="12" x2="38" y2="10" stroke="#F5B716" strokeWidth="2.8" strokeLinecap="round" />

        {/* Headband */}
        <path
          d="M9 22 C9 12 15 7 23 7 C31 7 37 12 37 22"
          stroke="#0B4FD8"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left ear pad */}
        <rect x="5" y="20" width="5.5" height="11" rx="2.75" fill="#0B4FD8" />
        {/* Right ear pad */}
        <rect x="33.5" y="20" width="5.5" height="11" rx="2.75" fill="#0B4FD8" />
        {/* Microphone boom */}
        <path
          d="M35 29 C35 34 30.5 36.5 25.5 36.5 H21"
          stroke="#0B4FD8"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="17" y="34.2" width="5" height="4.6" rx="2.3" fill="#0B4FD8" />
      </svg>
    </div>
  );
}

export function LocationTeardropPinSVG({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 32 36" className="w-full h-full" fill="none">
        <path
          d="M16 2 C10 2 5 7 5 13 C5 21.5 16 33 16 33 C16 33 27 21.5 27 13 C27 7 22 2 16 2 Z"
          fill="#0B4FD8"
        />
        <circle cx="16" cy="13" r="4.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
