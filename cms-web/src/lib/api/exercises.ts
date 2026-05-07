import { apiFetch } from "./client";
import type { ContentStatus, ExerciseDraft, Page } from "@/lib/domain/types";
import type { ExerciseUpsertRequest } from "@/lib/schemas/exercise";

export interface ListParams {
  status?: ContentStatus;
  page?: number;
  size?: number;
}

export function listExercises(params: ListParams = {}): Promise<Page<ExerciseDraft>> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.size !== undefined) q.set("size", String(params.size));
  const qs = q.toString();
  return apiFetch<Page<ExerciseDraft>>(`/api/cms/exercises${qs ? `?${qs}` : ""}`);
}

export function getExercise(id: string): Promise<ExerciseDraft> {
  return apiFetch<ExerciseDraft>(`/api/cms/exercises/${id}`);
}

export function createExercise(req: ExerciseUpsertRequest): Promise<ExerciseDraft> {
  return apiFetch<ExerciseDraft>("/api/cms/exercises", { method: "POST", body: req });
}

export function updateExercise(
  id: string,
  req: ExerciseUpsertRequest,
): Promise<ExerciseDraft> {
  return apiFetch<ExerciseDraft>(`/api/cms/exercises/${id}`, { method: "PUT", body: req });
}

export function deleteExercise(id: string): Promise<void> {
  return apiFetch<void>(`/api/cms/exercises/${id}`, { method: "DELETE" });
}

export function submitExercise(id: string, comment?: string): Promise<ExerciseDraft> {
  return apiFetch<ExerciseDraft>(`/api/cms/exercises/${id}/submit`, {
    method: "POST",
    body: comment ? { comment } : {},
  });
}

export function approveExercise(id: string, comment?: string): Promise<ExerciseDraft> {
  return apiFetch<ExerciseDraft>(`/api/cms/exercises/${id}/approve`, {
    method: "POST",
    body: comment ? { comment } : {},
  });
}

export function rejectExercise(id: string, comment: string): Promise<ExerciseDraft> {
  return apiFetch<ExerciseDraft>(`/api/cms/exercises/${id}/reject`, {
    method: "POST",
    body: { comment },
  });
}

export function archiveExercise(id: string): Promise<ExerciseDraft> {
  return apiFetch<ExerciseDraft>(`/api/cms/exercises/${id}/archive`, {
    method: "POST",
    body: {},
  });
}

export function unarchiveExercise(id: string): Promise<ExerciseDraft> {
  return apiFetch<ExerciseDraft>(`/api/cms/exercises/${id}/unarchive`, {
    method: "POST",
    body: {},
  });
}
