import { createBrowserClient } from "@/lib/supabase";
import type { Doctor, Patient, PatientStatus, Session } from "@/lib/types";

const supabase = createBrowserClient();

export const SESSION_EXPIRED_EVENT = "doccare_session_expired";

export class SessionExpiredError extends Error {
  constructor(message = "Session expired. Please log in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

export function notifySessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
}

/**
 * Proactively verifies and returns an active access token.
 * If token is expired or within 60 seconds of expiration, attempts to refresh it.
 */
async function getValidToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;

  const expiresAt = data.session.expires_at; // unix timestamp in seconds
  const now = Math.floor(Date.now() / 1000);

  // If token is expired or expiring within 60s, refresh session proactively
  if (expiresAt && expiresAt - now < 60) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (!error && refreshed.session) {
      return refreshed.session.access_token;
    }
  }

  return data.session.access_token;
}

/**
 * Authenticated fetch with proactive token validation, auto-refresh on 401,
 * and seamless single retry.
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = await getValidToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(url, { ...options, headers });

  // If 401 Unauthorized, token may be invalidated or expired on server; try refresh once
  if (res.status === 401) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (!error && refreshed.session) {
      token = refreshed.session.access_token;
      headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(url, { ...options, headers });
    } else {
      notifySessionExpired();
      throw new SessionExpiredError();
    }
  }

  return res;
}

async function jsonOrThrow(res: Response): Promise<Record<string, unknown>> {
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) {
    notifySessionExpired();
    throw new SessionExpiredError((json.error as string) || "Unauthorized");
  }
  if (!res.ok) throw new Error((json.error as string) || `Request failed (${res.status})`);
  return json as Record<string, unknown>;
}

export async function signIn(email: string, password: string): Promise<Doctor> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const doctor = await fetchDoctorProfile();
  if (!doctor) {
    await supabase.auth.signOut({ scope: "local" });
    throw new Error("No doctor profile is linked to this account. Contact your admin.");
  }
  return doctor;
}

/**
 * Sign out of the application.
 * Default scope is "local" so other devices (e.g. desktop clinic PC) remain logged in.
 * Pass scope: "global" to log out across all devices.
 */
export async function signOut(scope: "local" | "global" = "local"): Promise<void> {
  await supabase.auth.signOut({ scope });
}

export async function fetchDoctorProfile(): Promise<Doctor | null> {
  const token = await getValidToken();
  if (!token) return null;
  const res = await authFetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  return json.doctor ?? null;
}

export async function fetchActiveDoctor(): Promise<{ doctor: Doctor | null; open: boolean; walkinOpen: boolean }> {
  const res = await fetch("/api/doctors", { cache: "no-store" });
  const json = await jsonOrThrow(res);
  const doc = (json.doctor as Doctor | null) ?? null;
  return {
    doctor: doc,
    open: doc ? Boolean(doc.registration) : false,
    walkinOpen: doc ? Boolean(doc.walkin_registration) : false,
  };
}

export async function updateDoctorRegistration(id: string, registration: boolean): Promise<Doctor> {
  const res = await authFetch(`/api/doctors/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ registration }),
  });
  const json = await jsonOrThrow(res);
  return json.doctor as Doctor;
}

export async function updateDoctorWalkinRegistration(id: string, walkin_registration: boolean): Promise<Doctor> {
  const res = await authFetch(`/api/doctors/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ walkin_registration }),
  });
  const json = await jsonOrThrow(res);
  return json.doctor as Doctor;
}

export async function updateDoctorProfile(id: string, patch: Record<string, unknown>): Promise<Doctor> {
  const res = await authFetch(`/api/doctors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const json = await jsonOrThrow(res);
  return json.doctor as Doctor;
}

export async function fetchSession(doctorId: string, date: string): Promise<Session | null> {
  const res = await fetch(`/api/sessions?doctor_id=${doctorId}&date=${date}`);
  const json = await res.json().catch(() => ({}));
  return json.session ?? null;
}

export async function createSession(doctorId: string, date: string): Promise<Session> {
  const res = await authFetch("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ doctor_id: doctorId, date }),
  });
  const json = await jsonOrThrow(res);
  return json.session as Session;
}

export async function updateSession(id: string, patch: Record<string, unknown>): Promise<Session> {
  const res = await authFetch(`/api/sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const json = await jsonOrThrow(res);
  return json.session as Session;
}

export async function fetchAllPatients(doctorId?: string): Promise<Patient[]> {
  const res = await fetch("/api/patients");
  const json = await jsonOrThrow(res);
  const patients = (json.patients as Patient[]) ?? [];
  return patients.sort((a, b) => a.token_number - b.token_number);
}

export async function fetchSessionPatients(sessionId: string): Promise<Patient[]> {
  const res = await fetch(`/api/patients?session_id=${sessionId}`);
  const json = await res.json().catch(() => ({}));
  const patients = (json.patients as Patient[]) ?? [];
  return patients.sort((a, b) => a.token_number - b.token_number);
}

export type PatientForm = {
  name: string;
  age: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  time_slot: string;
  reason?: string;
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
  const res = await authFetch(`/api/patients/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  await jsonOrThrow(res);
}

export async function updatePatientTimeSlot(
  id: string,
  timeSlot: string,
  resetStatus?: boolean
): Promise<Patient> {
  const res = await authFetch(`/api/patients/${id}/time-slot`, {
    method: "PATCH",
    body: JSON.stringify({ time_slot: timeSlot, resetStatus }),
  });
  const json = await jsonOrThrow(res);
  return json.patient as Patient;
}

export async function updateDoctorName(id: string, name: string): Promise<void> {
  const res = await authFetch(`/api/doctors/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  await jsonOrThrow(res);
}

export async function fetchWalkinPatients(doctorId?: string): Promise<import("./types").WalkinPatient[]> {
  const res = await fetch("/api/walkin-patients");
  const json = await res.json().catch(() => ({}));
  const patients = (json.walkin_patients as import("./types").WalkinPatient[]) ?? [];
  return patients.sort((a, b) => a.token_number - b.token_number);
}

export async function addWalkinPatient(doctorId: string, form: import("./types").WalkinPatientForm): Promise<import("./types").WalkinPatient> {
  const res = await fetch("/api/walkin-patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...form, doctor_id: doctorId }),
  });
  const json = await jsonOrThrow(res);
  return json.patient as import("./types").WalkinPatient;
}

export async function updateWalkinPatientStatus(id: string, status: PatientStatus): Promise<void> {
  const res = await authFetch(`/api/walkin-patients/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  await jsonOrThrow(res);
}
