import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  approveExercise,
  createExercise,
  deleteExercise,
  getExercise,
  listExercises,
  rejectExercise,
  submitExercise,
  updateExercise,
  type ListParams,
} from "@/lib/api/exercises";
import type { ExerciseUpsertRequest } from "@/lib/schemas/exercise";

const EX_KEY = "exercises" as const;

export function useExercises(params: ListParams) {
  return useQuery({
    queryKey: [EX_KEY, "list", params],
    queryFn: () => listExercises(params),
  });
}

export function useExercise(id: string | undefined) {
  return useQuery({
    queryKey: [EX_KEY, "detail", id],
    queryFn: () => getExercise(id!),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: ExerciseUpsertRequest) => createExercise(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EX_KEY] }),
  });
}

export function useUpdateExercise(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: ExerciseUpsertRequest) => updateExercise(id, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EX_KEY] });
    },
  });
}

export function useDeleteExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EX_KEY] }),
  });
}

export function useSubmitExercise(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment?: string) => submitExercise(id, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EX_KEY] }),
  });
}

export function useApproveExercise(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment?: string) => approveExercise(id, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EX_KEY] }),
  });
}

export function useRejectExercise(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment: string) => rejectExercise(id, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EX_KEY] }),
  });
}
