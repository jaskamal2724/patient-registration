"use client";
import { useState, useCallback } from "react";
import type { Toast, ToastType } from "@/lib/types";

export function useToast() {
  const [toast, setToast] = useState<Toast>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  return { toast, showToast };
}
