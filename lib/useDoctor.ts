"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useToast } from "@/lib/useToast";
import type { Doctor, Patient, RegistrationWindow, Session } from "@/lib/types";

export function useDoctor(initialDoctor: Doctor) {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [session, setSession] = useState<Session | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentToken = patients.find(p => p.status === "in-progress")?.token_number || 0;

  const regWindow: RegistrationWindow = {
    isOpen: Boolean(doctor.registration),
    startTime: session?.start_time ?? null,
    endTime: session?.end_time ?? null,
    date: session?.date ?? null,
    maxPatients: session?.max_patients ?? 30,
    message: session?.message ?? "",
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().split("T")[0];
        let s = await api.fetchSession(doctor.id, today);
        if (!s) s = await api.createSession(doctor.id, today);
        if (!cancelled) setSession(s);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load session");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [doctor.id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const ps = await api.fetchAllPatients(doctor.id);
      if (!cancelled) setPatients(ps);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(interval); };
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
    if (!session) return;
    setLoading(true);
    try {
      if (w.date && w.date !== session.date) {
        const existing = await api.fetchSession(doctor.id, w.date);

        if (existing) {
          setSession(existing);
          const ps = await api.fetchAllPatients(doctor.id);
          setPatients(ps);
          showToast(`Loaded session for ${w.date}`, "info");
          setLoading(false);
          return;
        }

        const created = await api.createSession(doctor.id, w.date);
        setSession(created);
        const ps = await api.fetchAllPatients(doctor.id);
        setPatients(ps);
        showToast(`Created session for ${w.date}`, "info");
        setLoading(false);
        return;
      }

      const body: Record<string, unknown> = {};
      if (w.startTime !== undefined) body.start_time = w.startTime;
      if (w.endTime !== undefined) body.end_time = w.endTime;
      if (w.maxPatients !== undefined) body.max_patients = w.maxPatients;
      if (w.message !== undefined) body.message = w.message;

      const updated = await api.updateSession(session.id, body);
      setSession(updated);
    } catch {
      showToast("Failed to update settings", "error");
    } finally {
      setLoading(false);
    }
  }, [doctor.id, session, showToast]);

  const toggleRegistration = useCallback(async (open: boolean) => {
    setLoading(true);
    try {
      const updatedDoc = await api.updateDoctorRegistration(doctor.id, open);
      setDoctor(updatedDoc);
      if (session) {
        await api.updateSession(session.id, { is_open: open }).catch(() => {});
      }
      showToast(open ? "Registration is now OPEN" : "Registration is now CLOSED", open ? "success" : "info");
    } catch {
      showToast("Failed to toggle registration", "error");
    } finally {
      setLoading(false);
    }
  }, [doctor.id, session, showToast]);

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

      showToast(`Now calling Token #${nextWaiting.token_number}`, "success");
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

  const logout = useCallback(async () => {
    await api.signOut();
    router.push("/");
  }, [router]);

  return {
    doctor,
    doctorName: doctor.name,
    setDoctorName,
    logout,
    session,
    regWindow,
    setRegWindow,
    toggleRegistration,
    patients,
    currentToken,
    callNext,
    markDone,
    skipPatient,
    loading,
    error,
    toast,
  };
}
