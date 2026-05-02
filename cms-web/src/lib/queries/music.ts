import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createMusic,
  deleteMusic,
  getMusic,
  listMusic,
  updateMusic,
  type ListParams,
} from "@/lib/api/music";
import type { MusicUpsertRequest } from "@/lib/schemas/music";

const KEY = "music" as const;

export function useMusicList(params: ListParams = {}) {
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => listMusic(params),
  });
}

export function useAllMusic() {
  return useQuery({
    queryKey: [KEY, "all"],
    queryFn: () => listMusic({ page: 0, size: 500 }),
  });
}

export function useMusic(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => getMusic(id!),
    enabled: !!id,
  });
}

export function useCreateMusic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: MusicUpsertRequest) => createMusic(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateMusic(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: MusicUpsertRequest) => updateMusic(id, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteMusic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMusic(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
