import "server-only";
import { apiFetch } from "./client";

export type AdminSession = {
  id: string;
  is_current: boolean;
  ip_address: string;
  user_agent: string;
  browser: string;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  created_at: string;
  last_activity_at: string;
  expires_at: string;
  idle_expires_at: string;
};

export async function listSessions(): Promise<AdminSession[]> {
  return apiFetch<AdminSession[]>("/api/v1/auth/sessions");
}