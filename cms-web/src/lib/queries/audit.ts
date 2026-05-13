import { useQuery } from "@tanstack/react-query";

import { listAudit, type AuditEntityType } from "@/lib/api/audit";

export const AUDIT_KEY = "audit" as const;

export function useAuditTimeline(
  entityType: AuditEntityType,
  id: string | undefined,
) {
  return useQuery({
    queryKey: [AUDIT_KEY, entityType, id],
    queryFn: () => listAudit(entityType, id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}
