"use client";
import { useState, useCallback, useEffect } from "react";
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
  const [initialLoadError, setInitialLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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

  // Load the active doctor before showing any registration or queue status.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { doctor: doc, open } = await api.fetchActiveDoctor();
        if (cancelled) return;
        setDoctor(doc);
        setDoctorRegistrationOpen(open);
        if (!doc) {
          setPatients([]);
          setInitialLoading(false);
        }
      } catch (error) {
        console.error("Unable to load the active doctor", error);
        if (!cancelled) {
          setInitialLoadError(true);
          setInitialLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Use doctor.id (stable primitive string) as the effect dependency instead of
  // the full doctor object. This prevents the channel from being torn down and
  // re-created every time the doctors table update triggers setDoctor() with a
  // new object reference — which was the root cause of missed realtime events.
  const doctorId = doctor?.id ?? null;

  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;

    const loadPatients = async (isInitialLoad = false) => {
      try {
        const ps = await api.fetchAllPatients(doctorId);
        if (!cancelled) {
          setPatients(ps);
          setInitialLoadError(false);
          setInitialLoading(false);
        }
      } catch (error) {
        console.error("Unable to load patients for the patient portal", error);
        if (isInitialLoad && !cancelled) {
          setInitialLoadError(true);
          setInitialLoading(false);
        }
      }
    };

    // Initial data fetch
    loadPatients(true);

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
          if (
            payload.eventType === "UPDATE" &&
            payload.new.status === "in-progress" &&
            payload.old.status !== "in-progress"
          ) {
            window.location.reload();
          }
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
          try {
            const { doctor: doc, open } = await api.fetchActiveDoctor();
            if (!cancelled) {
              // Update doctor WITHOUT changing doctorId so the channel stays alive
              setDoctor(doc);
              setDoctorRegistrationOpen(open);
            }
          } catch (error) {
            console.error("Unable to refresh the active doctor", error);
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime channel status:", status);
      });

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [doctorId, reloadKey]); // stable primitives, NOT the full doctor object

  const retryInitialLoad = useCallback(() => {
    setInitialLoading(true);
    setInitialLoadError(false);
    setDoctor(null);
    setDoctorRegistrationOpen(false);
    setPatients([]);
    setReloadKey((key) => key + 1);
  }, []);

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
    initialLoadError,
    retryInitialLoad,
    toast,
    showToast,
  };
}
