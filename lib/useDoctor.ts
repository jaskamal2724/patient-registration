"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { createBrowserClient } from "@/lib/supabase";
import { useToast } from "@/lib/useToast";
import type { Doctor, Patient, RegistrationWindow, WalkinPatient } from "@/lib/types";

const supabase = createBrowserClient();

export function useDoctor(initialDoctor: Doctor) {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [walkinPatients, setWalkinPatients] = useState<WalkinPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentToken = patients.find(p => p.status === "in-progress")?.token_number || 0;

  const regWindow: RegistrationWindow = {
    isOpen: Boolean(doctor.registration),
    startTime: doctor.start_time || "09:00",
    endTime: doctor.end_time || "21:00",
    date: doctor.session_date || new Date().toISOString().split("T")[0],
    message: doctor.opd_message || "",
    patientsPerHour: doctor.patients_per_hour ?? 10,
    delayMinutes: doctor.delay_minutes ?? 0,
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [ps, wps] = await Promise.all([
          api.fetchAllPatients(doctor.id),
          api.fetchWalkinPatients(doctor.id).catch(() => []),
        ]);
        if (!cancelled) {
          setPatients(ps);
          setWalkinPatients(wps);
        }
      } catch {
        // quiet catch
      }
    };
    load();

    const channel = supabase
      .channel(`doctor-queue-${doctor.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patients",
        },
        load
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "walkin_patients",
        },
        load
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [doctor.id]);

  const setDoctorName = useCallback(async (name: string) => {
    setLoading(true);
    try {
      await api.updateDoctorName(doctor.id, name);
      setDoctor(prev => ({ ...prev, name }));
    } catch {
      showToast("Failed to update name", "error");
    } finally {
      setLoading(false);
    }
  }, [doctor.id, showToast]);

  const setRegWindow = useCallback(async (w: Partial<RegistrationWindow>) => {
    setLoading(true);
    try {
      const docPatch: Record<string, unknown> = {};
      if (w.date !== undefined) docPatch.session_date = w.date;
      if (w.startTime !== undefined) docPatch.start_time = w.startTime;
      if (w.endTime !== undefined) docPatch.end_time = w.endTime;
      if (w.message !== undefined) docPatch.opd_message = w.message;
      if (w.patientsPerHour !== undefined) docPatch.patients_per_hour = w.patientsPerHour;
      if (w.autoClose10AM !== undefined) docPatch.auto_close_10am = w.autoClose10AM;
      if (w.delayMinutes !== undefined) docPatch.delay_minutes = w.delayMinutes;

      const updatedDoc = await api.updateDoctorProfile(doctor.id, docPatch);
      setDoctor(updatedDoc);

      showToast("Settings saved", "success");
    } catch {
      showToast("Failed to update settings", "error");
    } finally {
      setLoading(false);
    }
  }, [doctor.id, showToast]);

  const toggleRegistration = useCallback(async (open: boolean) => {
    setLoading(true);
    try {
      const updatedDoc = await api.updateDoctorRegistration(doctor.id, open);
      setDoctor(updatedDoc);
      showToast(open ? "Registration is now OPEN" : "Registration is now CLOSED", open ? "success" : "info");
    } catch {
      showToast("Failed to toggle registration", "error");
    } finally {
      setLoading(false);
    }
  }, [doctor.id, showToast]);

  const callNext = useCallback(async () => {
    const nextWaiting = patients.find(p => p.status === "waiting");
    if (!nextWaiting) {
      showToast("No more patients in queue", "info");
      return;
    }

    setLoading(true);
    try {
      const currentInProgress = patients.find(p => p.status === "in-progress");

      if (currentInProgress) {
        showToast("Please mark the current patient as done first", "error");
        setLoading(false);
        return;
      }

      await api.updatePatientStatus(nextWaiting.id, "in-progress");

      setPatients(prev => prev.map(p => {
        if (p.id === nextWaiting.id) return { ...p, status: "in-progress" as const };
        return p;
      }));

      showToast(`Now calling Token ${nextWaiting.token_number}`, "success");
    } catch {
      showToast("Failed to call next patient", "error");
    } finally {
      setLoading(false);
    }
  }, [patients, showToast]);

  const markDone = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await api.updatePatientStatus(id, "done");
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status: "done" as const } : p));
      showToast("Patient marked as done", "success");
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const skipPatient = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await api.updatePatientStatus(id, "skipped");
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status: "skipped" as const } : p));
      showToast("Patient skipped", "info");
    } catch {
      showToast("Failed to skip", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const markWalkinDone = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await api.updateWalkinPatientStatus(id, "done");
      setWalkinPatients(prev => prev.map(p => p.id === id ? { ...p, status: "done" as const } : p));
      showToast("Walk-in patient marked as done", "success");
    } catch {
      showToast("Failed to update walk-in patient", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const skipWalkinPatient = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await api.updateWalkinPatientStatus(id, "skipped");
      setWalkinPatients(prev => prev.map(p => p.id === id ? { ...p, status: "skipped" as const } : p));
      showToast("Walk-in patient skipped", "info");
    } catch {
      showToast("Failed to skip walk-in patient", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const callNextWalkin = useCallback(async () => {
    const nextWaiting = walkinPatients.find(p => p.status === "waiting");
    if (!nextWaiting) {
      showToast("No more walk-in patients in queue", "info");
      return;
    }

    setLoading(true);
    try {
      await api.updateWalkinPatientStatus(nextWaiting.id, "in-progress");
      setWalkinPatients(prev => prev.map(p => {
        if (p.id === nextWaiting.id) return { ...p, status: "in-progress" as const };
        return p;
      }));
      showToast(`Calling Walk-in Token ${nextWaiting.walkin_token_display || nextWaiting.token_number}`, "success");
    } catch {
      showToast("Failed to call walk-in patient", "error");
    } finally {
      setLoading(false);
    }
  }, [walkinPatients, showToast]);

  const logout = useCallback(async () => {
    await api.signOut();
    router.push("/");
  }, [router]);

  return {
    doctor,
    doctorName: doctor.name,
    setDoctorName,
    logout,
    regWindow,
    setRegWindow,
    toggleRegistration,
    patients,
    walkinPatients,
    currentToken,
    callNext,
    markDone,
    skipPatient,
    markWalkinDone,
    skipWalkinPatient,
    callNextWalkin,
    loading,
    error,
    toast,
  };
}
