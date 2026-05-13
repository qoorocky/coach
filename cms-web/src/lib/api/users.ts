import { apiFetch } from "./client";

export type Role = "EDITOR" | "REVIEWER" | "ADMIN";

export interface CmsUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: Role;
  password: string;
}

export interface UpdateUserRequest {
  name: string;
  role: Role;
  active: boolean;
}

export function listUsers(): Promise<CmsUser[]> {
  return apiFetch<CmsUser[]>("/api/cms/users");
}

export function createUser(req: CreateUserRequest): Promise<CmsUser> {
  return apiFetch<CmsUser>("/api/cms/users", { method: "POST", body: req });
}

export function updateUser(id: number, req: UpdateUserRequest): Promise<CmsUser> {
  return apiFetch<CmsUser>(`/api/cms/users/${id}`, { method: "PUT", body: req });
}

export function setUserPassword(id: number, password: string): Promise<void> {
  return apiFetch<void>(`/api/cms/users/${id}/password`, {
    method: "PUT",
    body: { password },
  });
}
