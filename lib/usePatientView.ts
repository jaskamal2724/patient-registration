"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import * as api from "@/lib/api";
import { createBrowserClient } from "@/lib/supabase";
import { useToast } from "@/lib/useToast";
import type { Doctor, Patient, RegistrationWindow } from "@/lib/types";

const supabase = createBrowserClient();

export function usePatientView() {
  const { toast, showToast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctorRegistrationOpen, setDoctorRegistrationOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Stable ref so the realtime callback always calls the latest version
  // of loadPatients WITHOUT recreating the channel on every render.
  const loadPatientsRef = useRef<(() => Promise<void>) | null>(null);

  const currentToken =
    patients.find(
      (p) => p.status === "in-progress" || (p.status as string) === "in_progress",
    )?.token_number || 0;

  const isOpen = doctorRegistrationOpen;

  const regWindow: RegistrationWindow = {
    isOpen,
    startTime: doctor?.start_time || "09:00 AM",
    endTime: doctor?.end_time || "09:00 PM",
    date: doctor?.session_date || null,
    message:
      doctor?.opd_message ||
      (doctor ? `${doctor.name}'s OPD Session` : "OPD Registration"),
    patientsPerHour: doctor?.patients_per_hour ?? 10,
    delayMinutes: doctor?.delay_minutes ?? 0,
  };

  // Load active doctor once on mount
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setInitialLoading(false);
    }, 1000);

    const load = async () => {
      const { doctor: doc, open } = await api.fetchActiveDoctor();
      if (cancelled) return;
      setDoctor(doc);
      setDoctorRegistrationOpen(open);
      if (!doc && !cancelled) {
        setPatients([]);
      }
    };

    load();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Use doctor.id (stable primitive string) as the effect dependency instead of
  // the full doctor object. This prevents the channel from being torn down and
  // re-created every time the doctors table update triggers setDoctor() with a
  // new object reference — which was the root cause of missed realtime events.
  const doctorId = doctor?.id ?? null;

  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;

    const loadPatients = async () => {
      const ps = await api.fetchAllPatients(doctorId);
      if (!cancelled) {
        setPatients(ps);
        setInitialLoading(false);
      }
    };

    // Always keep the ref pointing at the freshest loadPatients closure,
    // so the realtime handler never calls a stale version.
    loadPatientsRef.current = loadPatients;

    // Initial data fetch
    loadPatients();

    const channel = supabase
      .channel(`patient-portal-realtime-${doctorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patients",
        },
        (payload) => {
          console.log("Realtime: patients change", payload);
          loadPatientsRef.current?.();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "doctors",
        },
        async (payload) => {
          console.log("Realtime: doctors change", payload);
          const { doctor: doc, open } = await api.fetchActiveDoctor();
          if (!cancelled) {
            // Update doctor WITHOUT changing doctorId so the channel stays alive
            setDoctor(doc);
            setDoctorRegistrationOpen(open);
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime channel status:", status);
      });

    // ── Polling fallback every 5 s ─────────────────────────────────────────
    // Catches any events that Realtime may have missed.
    const pollInterval = setInterval(() => {
      loadPatientsRef.current?.();
    }, 5000);

    return () => {
      cancelled = true;
      loadPatientsRef.current = null;
      clearInterval(pollInterval);
      void supabase.removeChannel(channel);
    };
  }, [doctorId]); // stable string primitive, NOT the full doctor object

  const addPatient = useCallback(
    async (form: api.PatientForm): Promise<Patient> => {
      if (!doctorId) throw new Error("Doctor not available");
      setLoading(true);
      try {
        const patient = await api.addPatient(doctorId, form);
        setPatients((prev) => [...prev, patient]);
        return patient;
      } finally {
        setLoading(false);
      }
    },
    [doctorId],
  );

  return {
    doctor,
    doctorName: doctor?.name ?? "Doctor",
    regWindow,
    patients,
    currentToken,
    addPatient,
    loading,
    initialLoading,
    toast,
    showToast,
  };
}
