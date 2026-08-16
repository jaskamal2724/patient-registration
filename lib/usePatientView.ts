"use client";
import { useState, useCallback, useEffect } from "react";
import * as api from "@/lib/api";
import { useToast } from "@/lib/useToast";
import type { Doctor, Patient, RegistrationWindow } from "@/lib/types";

export function usePatientView() {
  const { toast, showToast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctorRegistrationOpen, setDoctorRegistrationOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const currentToken =
    patients.find((p) => p.status === "in-progress")?.token_number || 0;

  // Check 10:00 AM cutoff rule on doctor.session_date or today's date
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const sessionDateStr = doctor?.session_date ? String(doctor.session_date).split("T")[0] : todayStr;

  let isCutoffClosed = false;
  let cutoffNotice: string | null = null;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isPast10AM = currentMinutes >= 600; // 10:00 AM cutoff (10 * 60)

  if (sessionDateStr === todayStr && isPast10AM) {
    isCutoffClosed = true;
    cutoffNotice = `Registration closed at 10:00 AM for today's OPD session (${sessionDateStr}).`;
  } else if (todayStr > sessionDateStr) {
    isCutoffClosed = true;
    cutoffNotice = `Registration for ${sessionDateStr} session is closed.`;
  }

  const isOpen = doctorRegistrationOpen && !isCutoffClosed;

  const regWindow: RegistrationWindow = {
    isOpen,
    startTime: doctor?.start_time || "09:00 AM",
    endTime: doctor?.end_time || "09:00 PM",
    date: doctor?.session_date || null,
    message: cutoffNotice || doctor?.opd_message || (doctor ? `${doctor.name}'s OPD Session` : "OPD Registration"),
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { doctor: doc, open } = await api.fetchActiveDoctor();
      if (cancelled) return;
      setDoctor(doc);
      setDoctorRegistrationOpen(open);
      if (doc) {
        const ps = await api.fetchAllPatients(doc.id);
        if (!cancelled) setPatients(ps);
      } else {
        setPatients([]);
      }
      if (!cancelled) setInitialLoading(false);
    };
    load();
    const interval = setInterval(load, 45000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const addPatient = useCallback(
    async (form: api.PatientForm): Promise<Patient> => {
      if (!doctor) throw new Error("Doctor not available");
      setLoading(true);
      try {
        const patient = await api.addPatient(doctor.id, form);
        setPatients((prev) => [...prev, patient]);
        return patient;
      } finally {
        setLoading(false);
      }
    },
    [doctor],
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
