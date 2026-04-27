import { apiFetch } from "@/lib/api/client";
import type { CurrentUser } from "./types";

export interface LoginRequest {
  email: string;
  password: string;
}

export function login(req: LoginRequest): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/api/auth/login", { method: "POST", body: req });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/api/auth/logout", { method: "POST" });
}

export function me(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/api/auth/me");
}
