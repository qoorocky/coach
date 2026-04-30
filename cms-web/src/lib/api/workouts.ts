import { apiFetch } from "./client";
import type { ContentStatus, Page, WorkoutDraft } from "@/lib/domain/types";
import type {
  SegmentUpsertRequest,
  WorkoutUpsertRequest,
} from "@/lib/schemas/workout";

export interface ListParams {
  status?: ContentStatus;
  page?: number;
  size?: number;
}

export function listWorkouts(params: ListParams = {}): Promise<Page<WorkoutDraft>> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.size !== undefined) q.set("size", String(params.size));
  const qs = q.toString();
  return apiFetch<Page<WorkoutDraft>>(`/api/cms/workouts${qs ? `?${qs}` : ""}`);
}

export function getWorkout(id: string): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>(`/api/cms/workouts/${id}`);
}

export function createWorkout(req: WorkoutUpsertRequest): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>("/api/cms/workouts", { method: "POST", body: req });
}

export function updateWorkout(id: string, req: WorkoutUpsertRequest): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>(`/api/cms/workouts/${id}`, { method: "PUT", body: req });
}

export function deleteWorkout(id: string): Promise<void> {
  return apiFetch<void>(`/api/cms/workouts/${id}`, { method: "DELETE" });
}

export function addSegment(id: string, req: SegmentUpsertRequest): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>(`/api/cms/workouts/${id}/segments`, {
    method: "POST",
    body: req,
  });
}

export function updateSegment(
  id: string,
  segmentId: string,
  req: SegmentUpsertRequest,
): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>(`/api/cms/workouts/${id}/segments/${segmentId}`, {
    method: "PUT",
    body: req,
  });
}

export function deleteSegment(id: string, segmentId: string): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>(`/api/cms/workouts/${id}/segments/${segmentId}`, {
    method: "DELETE",
  });
}

export function reorderSegments(id: string, segmentIds: string[]): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>(`/api/cms/workouts/${id}/segments/reorder`, {
    method: "POST",
    body: { segmentIds },
  });
}

export function submitWorkout(id: string, comment?: string): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>(`/api/cms/workouts/${id}/submit`, {
    method: "POST",
    body: comment ? { comment } : {},
  });
}

export function approveWorkout(id: string, comment?: string): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>(`/api/cms/workouts/${id}/approve`, {
    method: "POST",
    body: comment ? { comment } : {},
  });
}

export function rejectWorkout(id: string, comment: string): Promise<WorkoutDraft> {
  return apiFetch<WorkoutDraft>(`/api/cms/workouts/${id}/reject`, {
    method: "POST",
    body: { comment },
  });
}
