import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";

export function DocCareIcon({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-[20px] sm:rounded-[22px] bg-gradient-to-br from-[#0084FF] via-[#0066FF] to-[#0048D9] shadow-md shadow-blue-500/25 overflow-hidden ${className}`}
    >
      {/* Bottom Subtle Shading Arc */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none" />

      {/* Stethoscope Icon in White */}
      <svg viewBox="0 0 100 100" className="w-[68%] h-[68%] relative z-10" fill="none">
        {/* Stethoscope Arms */}
        <path
          d="M32 28C32 28 32 60 50 60C68 60 68 28 68 28"
          stroke="#FFFFFF"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Earpieces */}
        <circle cx="32" cy="28" r="6" fill="#FFFFFF" />
        <circle cx="68" cy="28" r="6" fill="#FFFFFF" />

        {/* Tubing loop down right */}
        <path
          d="M50 60V68C50 80 66 84 72 74C78 64 76 52 76 52"
          stroke="#FFFFFF"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Chestpiece */}
        <circle cx="76" cy="46" r="9.5" fill="#FFFFFF" />
        <circle cx="76" cy="46" r="4" fill="#0066FF" />
      </svg>
    </div>
  );
}

export default function DocCareLogo({
  variant = "header",
  subtitle,
  className = "",
}: {
  variant?: "header" | "full" | "icon";
  subtitle?: string;
  className?: string;
}) {
  const { t, language } = useLanguage();
  const displaySubtitle = subtitle !== undefined ? subtitle : t("appSubtitle");
  const router = useRouter();

  if (variant === "icon") {
    return <DocCareIcon className={className || "w-11 h-11"} />;
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
      <button onClick={() => router.push("/")} className="cursor-pointer shrink-0">
        <DocCareIcon className="w-10 h-10 sm:w-12 sm:h-12" />
      </button>
      <div className="text-left leading-none shrink-0">
        <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight leading-none mb-1 whitespace-nowrap">
          {language === "hi" ? (
            <>
              <span className="text-[#0B1938]">डॉक</span>
              <span className="text-[#0066FF]">केयर</span>
            </>
          ) : (
            <>
              <span className="text-[#0B1938]">Doc</span>
              <span className="text-[#0066FF]">Care</span>
            </>
          )}
        </h1>
        <p className="font-body text-[11px] sm:text-xs text-slate-500 font-medium tracking-wide leading-none whitespace-nowrap">
          {displaySubtitle}
        </p>
      </div>
    </div>
  );
}
