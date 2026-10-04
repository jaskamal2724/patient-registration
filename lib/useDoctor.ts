"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { createBrowserClient } from "@/lib/supabase";
import { useToast } from "@/lib/useToast";
import type {
  Doctor,
  Patient,
  RegistrationWindow,
  WalkinPatient,
} from "@/lib/types";

const supabase = createBrowserClient();

export function useDoctor(initialDoctor: Doctor) {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [walkinPatients, setWalkinPatients] = useState<WalkinPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentToken =
    patients.find(
      (p) =>
        p.status === "in-progress" || (p.status as string) === "in_progress",
    )?.slot_token_number ||
    patients.find(
      (p) =>
        p.status === "in-progress" || (p.status as string) === "in_progress",
    )?.token_number ||
    0;

  const regWindow: RegistrationWindow = {
    isOpen: Boolean(doctor.registration),
    startTime: doctor.start_time || "10:00",
    endTime: doctor.end_time || "19:00",
    date: doctor.session_date || new Date().toISOString().split("T")[0],
    message: doctor.opd_message || "",
    patientsPerHour: doctor.patients_per_hour ?? 10,
    delayMinutes: doctor.delay_minutes ?? 0,
  };

  // Keep doctor state synchronized whenever initialDoctor updates
  useEffect(() => {
    if (initialDoctor) {
      setDoctor(initialDoctor);
    }
  }, [initialDoctor]);

  // Fetch the latest fresh doctor record directly from the database on mount
  useEffect(() => {
    let cancelled = false;
    const fetchFreshDoctor = async () => {
      try {
        const res = await fetch(`/api/doctors/${doctor.id}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.doctor && !cancelled) {
            setDoctor(json.doctor);
          }
        }
      } catch {}
    };
    fetchFreshDoctor();
    return () => {
      cancelled = true;
    };
  }, [doctor.id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [ps, wps] = await Promise.all([
          api.fetchAllPatients(),
          api.fetchWalkinPatients().catch(() => []),
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
        load,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "walkin_patients",
        },
        load,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "doctors",
          filter: `id=eq.${doctor.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            setDoctor(payload.new as Doctor);
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [doctor.id]);

  const setDoctorName = useCallback(
    async (name: string) => {
      setLoading(true);
      try {
        await api.updateDoctorName(doctor.id, name);
        setDoctor((prev) => ({ ...prev, name }));
      } catch {
        showToast("Failed to update name", "error");
      } finally {
        setLoading(false);
      }
    },
    [doctor.id, showToast],
  );

  const setRegWindow = useCallback(
    async (w: Partial<RegistrationWindow>) => {
      setLoading(true);
      try {
        const docPatch: Record<string, unknown> = {};
        if (w.date !== undefined) docPatch.session_date = w.date;
        if (w.startTime !== undefined) docPatch.start_time = w.startTime;
        if (w.endTime !== undefined) docPatch.end_time = w.endTime;
        if (w.message !== undefined) docPatch.opd_message = w.message;
        if (w.patientsPerHour !== undefined)
          docPatch.patients_per_hour = w.patientsPerHour;
        if (w.autoClose10AM !== undefined)
          docPatch.auto_close_10am = w.autoClose10AM;
        if (w.delayMinutes !== undefined)
          docPatch.delay_minutes = w.delayMinutes;

        const updatedDoc = await api.updateDoctorProfile(doctor.id, docPatch);
        setDoctor(updatedDoc);

        showToast("Settings saved", "success");
      } catch {
        showToast("Failed to update settings", "error");
      } finally {
        setLoading(false);
      }
    },
    [doctor.id, showToast],
  );

  const toggleRegistration = useCallback(
    async (open: boolean) => {
      setLoading(true);
      try {
        const updatedDoc = await api.updateDoctorRegistration(doctor.id, open);
        setDoctor(updatedDoc);
        showToast(
          open ? "Registration is now OPEN" : "Registration is now CLOSED",
          open ? "success" : "info",
        );
      } catch {
        showToast("Failed to toggle registration", "error");
      } finally {
        setLoading(false);
      }
    },
    [doctor.id, showToast],
  );

  const callNext = useCallback(async () => {
    const nextWaiting = patients.find((p) => p.status === "waiting");
    const currentInProgress = patients.find(
      (p) =>
        p.status === "in-progress" || (p.status as string) === "in_progress",
    );

    if (!nextWaiting) {
      if (currentInProgress) {
        setLoading(true);
        try {
          await api.updatePatientStatus(currentInProgress.id, "done");
          setPatients((prev) =>
            prev.map((p) =>
              p.id === currentInProgress.id
                ? { ...p, status: "done" as const }
                : p,
            ),
          );
          const doneToken =
            currentInProgress.slot_token_number ||
            currentInProgress.token_number;
          showToast(`Completed Token ${doneToken}`, "success");
        } catch {
          showToast("Failed to complete patient", "error");
        } finally {
          setLoading(false);
        }
        return;
      }
      showToast("No more patients in queue", "info");
      return;
    }

    setLoading(true);
    try {
      // Mark current in-progress patient as done upon calling the next patient
      if (currentInProgress) {
        await api.updatePatientStatus(currentInProgress.id, "done");
      }

      await api.updatePatientStatus(nextWaiting.id, "in-progress");

      setPatients((prev) =>
        prev.map((p) => {
          if (currentInProgress && p.id === currentInProgress.id) {
            return { ...p, status: "done" as const };
          }
          if (p.id === nextWaiting.id) {
            return { ...p, status: "in-progress" as const };
          }
          return p;
        }),
      );

      const tokenDisplay =
        nextWaiting.slot_token_number || nextWaiting.token_number;
      showToast(`Now calling Token ${tokenDisplay}`, "success");
    } catch {
      showToast("Failed to call next patient", "error");
    } finally {
      setLoading(false);
    }
  }, [patients, showToast]);

  const markDone = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await api.updatePatientStatus(id, "done");
        setPatients((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: "done" as const } : p,
          ),
        );
        showToast("Patient marked as done", "success");
      } catch {
        showToast("Failed to update", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const skipPatient = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await api.updatePatientStatus(id, "skipped");
        setPatients((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: "skipped" as const } : p,
          ),
        );
        showToast("Patient skipped", "info");
      } catch {
        showToast("Failed to skip", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const markWalkinDone = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await api.updateWalkinPatientStatus(id, "done");
        setWalkinPatients((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: "done" as const } : p,
          ),
        );
        showToast("Walk-in patient marked as done", "success");
      } catch {
        showToast("Failed to update walk-in patient", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const skipWalkinPatient = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await api.updateWalkinPatientStatus(id, "skipped");
        setWalkinPatients((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: "skipped" as const } : p,
          ),
        );
        showToast("Walk-in patient skipped", "info");
      } catch {
        showToast("Failed to skip walk-in patient", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const callNextWalkin = useCallback(async () => {
    const nextWaiting = walkinPatients.find((p) => p.status === "waiting");
    const currentInProgress = walkinPatients.find(
      (p) =>
        p.status === "in-progress" || (p.status as string) === "in_progress",
    );

    if (!nextWaiting) {
      if (currentInProgress) {
        setLoading(true);
        try {
          await api.updateWalkinPatientStatus(currentInProgress.id, "done");
          setWalkinPatients((prev) =>
            prev.map((p) =>
              p.id === currentInProgress.id
                ? { ...p, status: "done" as const }
                : p,
            ),
          );
          const doneToken =
            currentInProgress.walkin_token_display ||
            `W-${currentInProgress.token_number}`;
          showToast(`Completed Walk-in Token ${doneToken}`, "success");
        } catch {
          showToast("Failed to complete walk-in patient", "error");
        } finally {
          setLoading(false);
        }
        return;
      }
      showToast("No more walk-in patients in queue", "info");
      return;
    }

    setLoading(true);
    try {
      // Mark current in-progress walk-in patient as done upon calling the next patient
      if (currentInProgress) {
        await api.updateWalkinPatientStatus(currentInProgress.id, "done");
      }

      await api.updateWalkinPatientStatus(nextWaiting.id, "in-progress");

      setWalkinPatients((prev) =>
        prev.map((p) => {
          if (currentInProgress && p.id === currentInProgress.id) {
            return { ...p, status: "done" as const };
          }
          if (p.id === nextWaiting.id) {
            return { ...p, status: "in-progress" as const };
          }
          return p;
        }),
      );

      const tokenDisplay =
        nextWaiting.walkin_token_display ||
        `W-${nextWaiting.token_number}`;
      showToast(
        `Now calling Walk-in Token ${tokenDisplay}`,
        "success",
      );
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
