"use client";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import type { Toast } from "@/lib/types";

export default function Toast({ toast }: { toast: Toast }) {
  if (!toast) return null;

  const config = {
    success: { icon: CheckCircle2, bg: "bg-teal-700", border: "border-teal-500" },
    error: { icon: XCircle, bg: "bg-red-700", border: "border-red-500" },
    info: { icon: Info, bg: "bg-slate-700", border: "border-slate-500" },
  };
  const { icon: Icon, bg, border } = config[toast.type];

  return (
    <div className={`fixed top-5 right-5 z-50 toast-enter flex items-center gap-3 px-5 py-3.5 rounded-xl text-white text-sm font-body shadow-2xl border ${bg} ${border} max-w-xs`}>
      <Icon size={18} className="shrink-0" />
      <span>{toast.message}</span>
    </div>
  );
}
