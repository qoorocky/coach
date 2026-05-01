import type { SyncResponse } from "@coach/shared-types";
import { apiFetch } from "./client";

export function fetchSync(since: number): Promise<SyncResponse> {
  return apiFetch<SyncResponse>(`/api/v1/content/sync?since=${since}`);
}
