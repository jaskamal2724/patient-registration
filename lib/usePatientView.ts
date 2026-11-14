"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import * as api from "@/lib/api";
import { createBrowserClient } from "@/lib/supabase";
import { useToast } from "@/lib/useToast";
import { formatDelayText, sortPatientsBySlot } from "@/app/util/timeSlot";
import type { Doctor, Patient, RegistrationWindow, WalkinPatient } from "@/lib/types";

const supabase = createBrowserClient();

export function usePatientView() {
  const { toast, showToast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctorRegistrationOpen, setDoctorRegistrationOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [walkinPatients, setWalkinPatients] = useState<WalkinPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const prevDelayRef = useRef<number | null>(null);
  const prevBreakRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (doctor?.delay_minutes !== undefined && doctor?.delay_minutes !== null) {
      if (prevDelayRef.current === null) {
        prevDelayRef.current = doctor.delay_minutes;
      }
    }
    if (doctor?.short_break !== undefined && doctor?.short_break !== null) {
      if (prevBreakRef.current === null) {
        prevBreakRef.current = Boolean(doctor.short_break);
      }
    }
  }, [doctor?.delay_minutes, doctor?.short_break]);

  const currentToken =
    patients.find(
      (p) =>
        p.status === "in-progress" || (p.status as string) === "in_progress",
    )?.token_number || 0;

  const isOpen = doctorRegistrationOpen;

  const regWindow: RegistrationWindow = {
    isOpen,
    startTime: doctor?.start_time || "10:00",
    endTime: doctor?.end_time || "19:00",
    date: doctor?.session_date || null,
    message:
      doctor?.opd_message ||
      (doctor ? `${doctor.name}'s OPD Session` : "OPD Registration"),
    patientsPerHour: doctor?.patients_per_hour ?? 10,
    delayMinutes: doctor?.delay_minutes ?? 0,
    shortBreak: Boolean(doctor?.short_break),
  };

  const applyDoctorUpdate = useCallback((doc: Doctor) => {
    const newDelay = doc.delay_minutes ?? 0;
    const oldDelay = prevDelayRef.current;
    if (oldDelay !== null && newDelay !== oldDelay) {
      prevDelayRef.current = newDelay;
      if (newDelay > 0) {
        showToast(
          `⚠️ Doctor Running Late Alert: +${formatDelayText(newDelay)} delay announced. Slot timings remain unchanged.`,
          "warning",
          6000
        );
      } else {
        showToast("ℹ️ Doctor delay cleared. Schedule is back on time.", "info", 4000);
      }
    } else if (prevDelayRef.current === null) {
      prevDelayRef.current = newDelay;
    }

    const newBreak = Boolean(doc.short_break);
    const oldBreak = prevBreakRef.current;
    if (oldBreak !== null && newBreak !== oldBreak) {
      prevBreakRef.current = newBreak;
      if (newBreak) {
        showToast("☕ Doctor is on a short break. Consultations are temporarily paused.", "warning", 5000);
      } else {
        showToast("✅ Doctor has resumed consultations. Queue is active.", "success", 4000);
      }
    } else if (prevBreakRef.current === null) {
      prevBreakRef.current = newBreak;
    }

    setDoctor((prev) => (prev ? { ...prev, ...doc } : doc));
    if ("registration" in doc && doc.registration !== undefined && doc.registration !== null) {
      setDoctorRegistrationOpen(Boolean(doc.registration));
    }
  }, [showToast]);

  // Load the active doctor before showing any registration or queue status,
  // and keep doctor synchronized via fast polling, visibility listeners, and cross-tab broadcasts.
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

    // 1. Fast background polling fallback (every 3 seconds)
    const pollInterval = setInterval(async () => {
      try {
        const { doctor: doc } = await api.fetchActiveDoctor();
        if (!cancelled && doc) {
          applyDoctorUpdate(doc);
        }
      } catch {
        // silent
      }
    }, 3000);

    // 2. Refetch immediately when tab gains focus or becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        api.fetchActiveDoctor().then(({ doctor: doc }) => {
          if (!cancelled && doc) applyDoctorUpdate(doc);
        }).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    // 3. Instant cross-tab BroadcastChannel listener (0ms within the same browser)
    let bc: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("doccare-live-sync");
        bc.onmessage = (event) => {
          if (event.data?.doctor && !cancelled) {
            applyDoctorUpdate(event.data.doctor);
          }
        };
      }
    } catch {
      // ignore
    }

    // 4. LocalStorage cross-tab fallback (0ms)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "doccare_doctor_sync" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.doctor && !cancelled) {
            applyDoctorUpdate(parsed.doctor);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    // 5. Global Supabase Realtime Broadcast channel across all devices
    const globalSyncChannel = supabase
      .channel("doccare-global-sync")
      .on("broadcast", { event: "doctor_updated" }, (payload) => {
        if (payload.payload && !cancelled) {
          applyDoctorUpdate(payload.payload as Doctor);
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      window.removeEventListener("storage", handleStorage);
      try {
        bc?.close();
      } catch {}
      void supabase.removeChannel(globalSyncChannel);
    };
  }, [reloadKey, applyDoctorUpdate]);

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
        const [ps, wps] = await Promise.all([
          api.fetchAllPatients(),
          api.fetchWalkinPatients().catch(() => []),
        ]);
        if (!cancelled) {
          setPatients(sortPatientsBySlot(ps));
          setWalkinPatients(wps);
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
      console.log("Realtime patients event:", payload);

      if (payload.eventType === "UPDATE") {
        const updatedPatient = payload.new as Patient;

        setPatients((prev) => {
          const exists = prev.some((patient) => patient.id === updatedPatient.id);
          const next = exists
            ? prev.map((patient) =>
                patient.id === updatedPatient.id
                  ? { ...patient, ...updatedPatient }
                  : patient
              )
            : [...prev, updatedPatient];
          return sortPatientsBySlot(next);
        });
        void loadPatients();
      }

      if (payload.eventType === "INSERT") {
        const newPatient = payload.new as Patient;

        setPatients((prev) => {
          if (prev.some((patient) => patient.id === newPatient.id)) {
            return prev;
          }
          return sortPatientsBySlot([...prev, newPatient]);
        });
        void loadPatients();
      }

      if (payload.eventType === "DELETE") {
        const deletedPatient = payload.old as Patient;

        setPatients((prev) =>
          prev.filter((patient) => patient.id !== deletedPatient.id)
        );
        void loadPatients();
      }
    }
  )
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "walkin_patients",
    },
    (payload) => {
      console.log("Realtime walkin patients event:", payload);

      if (payload.eventType === "UPDATE") {
        const updatedWalkin = payload.new as WalkinPatient;

        setWalkinPatients((prev) => {
          const exists = prev.some((patient) => patient.id === updatedWalkin.id);
          const next = exists
            ? prev.map((patient) =>
                patient.id === updatedWalkin.id
                  ? { ...patient, ...updatedWalkin }
                  : patient
              )
            : [...prev, updatedWalkin];
          return next.sort((a, b) => a.token_number - b.token_number);
        });
        void loadPatients();
      }

      if (payload.eventType === "INSERT") {
        const newWalkin = payload.new as WalkinPatient;

        setWalkinPatients((prev) => {
          if (prev.some((patient) => patient.id === newWalkin.id)) {
            return prev;
          }
          return [...prev, newWalkin].sort(
            (a, b) => a.token_number - b.token_number
          );
        });
        void loadPatients();
      }

      if (payload.eventType === "DELETE") {
        const deletedWalkin = payload.old as WalkinPatient;

        setWalkinPatients((prev) =>
          prev.filter((patient) => patient.id !== deletedWalkin.id)
        );
        void loadPatients();
      }
    }
  )
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "doctors",
      filter: `id=eq.${doctorId}`,
    },
    async (payload) => {
      console.log("Realtime doctors event:", payload);

      if (payload.new && typeof payload.new === "object") {
        applyDoctorUpdate(payload.new as Doctor);
      }

      try {
        const { doctor: doc } = await api.fetchActiveDoctor();
        if (!cancelled && doc) {
          applyDoctorUpdate(doc);
        }
      } catch (error) {
        console.error("Unable to refresh the active doctor", error);
      }
    }
  )
  .subscribe((status) => {
    console.log("Realtime channel status:", status);
  });

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [doctorId, reloadKey, applyDoctorUpdate]); // stable primitives, NOT the full doctor object

  const retryInitialLoad = useCallback(() => {
    setInitialLoading(true);
    setInitialLoadError(false);
    setDoctor(null);
    setDoctorRegistrationOpen(false);
    setPatients([]);
    setWalkinPatients([]);
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
    walkinPatients,
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
