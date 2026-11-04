"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, AlertCircle } from "lucide-react";

interface ConsultationTimerProps {
  patientId: string;
  targetSeconds?: number; // default 180 (3 mins)
  className?: string;
}

export default function ConsultationTimer({
  patientId,
  targetSeconds = 180,
  className = "",
}: ConsultationTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(targetSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isOvertime, setIsOvertime] = useState<boolean>(false);
  const prevPatientIdRef = useRef<string>(patientId);

  // Reset timer when a new patient is called
  useEffect(() => {
    if (patientId !== prevPatientIdRef.current) {
      prevPatientIdRef.current = patientId;
      setSecondsLeft(targetSeconds);
      setIsRunning(true);
      setIsOvertime(false);
    }
  }, [patientId, targetSeconds]);

  // Tick every second
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsOvertime(true);
          return prev - 1; // Negative values count overtime
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleRunning = () => setIsRunning((r) => !r);

  const resetTimer = () => {
    setSecondsLeft(targetSeconds);
    setIsRunning(true);
    setIsOvertime(false);
  };

  const isWarning = secondsLeft <= 60 && secondsLeft > 0;
  const isExpired = secondsLeft <= 0;

  const absSeconds = Math.abs(secondsLeft);
  const minutes = Math.floor(absSeconds / 60);
  const remainderSeconds = absSeconds % 60;
  const formattedTime = `${isExpired ? "+" : ""}${minutes.toString().padStart(2, "0")}:${remainderSeconds.toString().padStart(2, "0")}`;

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
        isExpired
          ? "bg-red-500/20 border-red-400/60 text-red-100 animate-pulse"
          : isWarning
          ? "bg-amber-500/20 border-amber-400/50 text-amber-100"
          : "bg-white/15 border-white/25 text-white"
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        {isExpired ? (
          <AlertCircle size={14} className="text-red-300 animate-bounce" />
        ) : (
          <Clock size={14} className={isWarning ? "text-amber-300 animate-pulse" : "text-white/80"} />
        )}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 leading-none">
            {isExpired ? "Overtime" : "Consult Timer"}
          </span>
          <span className="font-mono-custom text-sm sm:text-base font-black tracking-tight leading-none mt-0.5">
            {formattedTime}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 pl-1 border-l border-white/20">
        <button
          type="button"
          onClick={toggleRunning}
          className="p-1 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 text-white transition-all cursor-pointer"
          title={isRunning ? "Pause timer" : "Resume timer"}
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button
          type="button"
          onClick={resetTimer}
          className="p-1 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 text-white transition-all cursor-pointer"
          title="Reset timer to 3:00"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
