"use client";
import { useState, useCallback, useEffect } from "react";
import * as api from "@/lib/api";
import { useToast } from "@/lib/useToast";
import type { Doctor, Patient, RegistrationWindow } from "@/lib/types";

export function usePatientView() {
  const { toast, showToast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const currentToken =
    patients.find((p) => p.status === "in-progress")?.token_number || 0;

  const regWindow: RegistrationWindow = {
    isOpen,
    startTime: null,
    endTime: null,
    date: null,
    maxPatients: 50,
    message: doctor ? `${doctor.name}'s OPD Session` : "OPD Registration",
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { doctor: doc, open } = await api.fetchActiveDoctor();
      if (cancelled) return;
      setDoctor(doc);
      setIsOpen(open);
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
