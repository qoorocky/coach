import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addSegment,
  approveWorkout,
  archiveWorkout,
  createWorkout,
  deleteSegment,
  deleteWorkout,
  getWorkout,
  listWorkouts,
  rejectWorkout,
  reorderSegments,
  submitWorkout,
  unarchiveWorkout,
  updateSegment,
  updateWorkout,
  type ListParams,
} from "@/lib/api/workouts";
import type {
  SegmentUpsertRequest,
  WorkoutUpsertRequest,
} from "@/lib/schemas/workout";

const WK_KEY = "workouts" as const;

export function useWorkouts(params: ListParams) {
  return useQuery({
    queryKey: [WK_KEY, "list", params],
    queryFn: () => listWorkouts(params),
  });
}

export function useWorkout(id: string | undefined) {
  return useQuery({
    queryKey: [WK_KEY, "detail", id],
    queryFn: () => getWorkout(id!),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: WorkoutUpsertRequest) => createWorkout(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useUpdateWorkout(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: WorkoutUpsertRequest) => updateWorkout(id, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useAddSegment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: SegmentUpsertRequest) => addSegment(id, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useUpdateSegment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ segmentId, req }: { segmentId: string; req: SegmentUpsertRequest }) =>
      updateSegment(id, segmentId, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useDeleteSegment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (segmentId: string) => deleteSegment(id, segmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useReorderSegments(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (segmentIds: string[]) => reorderSegments(id, segmentIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useSubmitWorkout(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment?: string) => submitWorkout(id, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useApproveWorkout(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment?: string) => approveWorkout(id, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useRejectWorkout(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment: string) => rejectWorkout(id, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useArchiveWorkout(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => archiveWorkout(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}

export function useUnarchiveWorkout(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unarchiveWorkout(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WK_KEY] }),
  });
}
