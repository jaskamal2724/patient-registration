import { createBrowserClient } from "@/lib/supabase";
import type { Doctor, Patient, PatientStatus, Session } from "@/lib/types";

const supabase = createBrowserClient();

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function jsonOrThrow(res: Response): Promise<Record<string, unknown>> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json.error as string) || `Request failed (${res.status})`);
  return json as Record<string, unknown>;
}

export async function signIn(email: string, password: string): Promise<Doctor> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const doctor = await fetchDoctorProfile();
  if (!doctor) {
    await supabase.auth.signOut();
    throw new Error("No doctor profile is linked to this account. Contact your admin.");
  }
  return doctor;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function fetchDoctorProfile(): Promise<Doctor | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  const res = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${data.session.access_token}` },
  });
  const json = await res.json();
  return json.doctor ?? null;
}

export async function fetchActiveDoctor(): Promise<{ doctor: Doctor | null; open: boolean }> {
  const res = await fetch("/api/doctors");
  const json = await res.json();
  const doc = (json.doctor as Doctor | null) ?? null;
  return { doctor: doc, open: doc ? Boolean(doc.registration) : false };
}

export async function updateDoctorRegistration(id: string, registration: boolean): Promise<Doctor> {
  const res = await fetch(`/api/doctors/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ registration }),
  });
  const json = await jsonOrThrow(res);
  return json.doctor as Doctor;
}

export async function fetchSession(doctorId: string, date: string): Promise<Session | null> {
  const res = await fetch(`/api/sessions?doctor_id=${doctorId}&date=${date}`);
  const json = await res.json();
  return json.session ?? null;
}

export async function createSession(doctorId: string, date: string): Promise<Session> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ doctor_id: doctorId, date }),
  });
  const json = await jsonOrThrow(res);
  return json.session as Session;
}

export async function updateSession(id: string, patch: Record<string, unknown>): Promise<Session> {
  const res = await fetch(`/api/sessions/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(patch),
  });
  const json = await jsonOrThrow(res);
  return json.session as Session;
}

export async function fetchAllPatients(doctorId: string): Promise<Patient[]> {
  const res = await fetch(`/api/patients?doctor_id=${doctorId}`);
  const json = await res.json();
  const patients = (json.patients as Patient[]) ?? [];
  return patients.sort((a, b) => a.token_number - b.token_number);
}

export async function fetchSessionPatients(sessionId: string): Promise<Patient[]> {
  const res = await fetch(`/api/patients?session_id=${sessionId}`);
  const json = await res.json();
  const patients = (json.patients as Patient[]) ?? [];
  return patients.sort((a, b) => a.token_number - b.token_number);
}

export type PatientForm = {
  name: string;
  age: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  reason: string;
};

export async function addPatient(doctorId: string, form: PatientForm): Promise<Patient> {
  const res = await fetch("/api/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...form, doctor_id: doctorId }),
  });
  const json = await jsonOrThrow(res);
  return json.patient as Patient;
}

export async function updatePatientStatus(id: string, status: PatientStatus): Promise<void> {
  await fetch(`/api/patients/${id}/status`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function updateDoctorName(id: string, name: string): Promise<void> {
  await fetch(`/api/doctors/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ name }),
  });
}
