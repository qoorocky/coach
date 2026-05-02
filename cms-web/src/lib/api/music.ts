import { apiFetch } from "./client";
import type { MusicTrack, Page } from "@/lib/domain/types";
import type { MusicUpsertRequest } from "@/lib/schemas/music";

export interface ListParams {
  page?: number;
  size?: number;
}

export function listMusic(params: ListParams = {}): Promise<Page<MusicTrack>> {
  const q = new URLSearchParams();
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.size !== undefined) q.set("size", String(params.size));
  const qs = q.toString();
  return apiFetch<Page<MusicTrack>>(`/api/cms/music${qs ? `?${qs}` : ""}`);
}

export function getMusic(id: string): Promise<MusicTrack> {
  return apiFetch<MusicTrack>(`/api/cms/music/${id}`);
}

export function createMusic(req: MusicUpsertRequest): Promise<MusicTrack> {
  return apiFetch<MusicTrack>("/api/cms/music", { method: "POST", body: req });
}

export function updateMusic(id: string, req: MusicUpsertRequest): Promise<MusicTrack> {
  return apiFetch<MusicTrack>(`/api/cms/music/${id}`, { method: "PUT", body: req });
}

export function deleteMusic(id: string): Promise<void> {
  return apiFetch<void>(`/api/cms/music/${id}`, { method: "DELETE" });
}
