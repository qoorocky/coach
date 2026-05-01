import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteSession,
  getSession,
  listSessions,
  saveSession,
} from "../sessions/store";
import type { StoredSession } from "../sessions/types";

const KEY = {
  list: ["sessions"] as const,
  detail: (id: string) => ["sessions", id] as const,
};

export function useSessions() {
  return useQuery({
    queryKey: KEY.list,
    queryFn: () => listSessions(),
  });
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEY.detail(id) : ["sessions", "_undefined"],
    queryFn: () => (id ? getSession(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });
}

export function useSaveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: StoredSession) => saveSession(s),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.list }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.list }),
  });
}
