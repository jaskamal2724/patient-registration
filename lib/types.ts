export type PatientStatus = "waiting" | "in-progress" | "done" | "skipped";

export type Patient = {
  id: string;
  session_id: string;
  token_number: number;
  slot_token_number?: number;
  time_slot?: string;
  name: string;
  age: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  reason?: string;
  registered_at: string;
  status: PatientStatus;
};

export type Session = {
  id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_patients: number;
  message: string;
  is_open: boolean;
  created_at: string;
};

export type Doctor = {
  id: string;
  name: string;
  email: string;
  registration?: boolean | null;
  session_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  opd_message?: string | null;
  created_at: string;
};

export type ToastType = "success" | "error" | "info";

export type Toast = {
  message: string;
  type: ToastType;
} | null;

export type RegistrationWindow = {
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
  date: string | null;
  message: string;
};
