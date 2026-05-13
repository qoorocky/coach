import { apiFetch } from "./client";

export type ReviewActionType =
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "PUBLISH"
  | "ARCHIVE"
  | "UNARCHIVE";

export type AuditEntityType = "EXERCISE" | "WORKOUT";

export interface AuditEntry {
  id: number;
  action: ReviewActionType;
  comment: string | null;
  performedBy: number;
  performedByName: string | null;
  performedAt: string;
}

export function listAudit(
  entityType: AuditEntityType,
  id: string,
): Promise<AuditEntry[]> {
  const qs = new URLSearchParams({ entityType, id });
  return apiFetch<AuditEntry[]>(`/api/cms/audit?${qs.toString()}`);
}
