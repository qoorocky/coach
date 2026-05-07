import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getExercise,
  getExercisesByIds,
  getTracksByIds,
  getWorkout,
  listExercises,
  listMusic,
  listWorkouts,
} from "../db";
import { getLastSync, runSync, type SyncResult } from "../sync/service";

const KEY = {
  workouts: ["workouts"] as const,
  workout: (id: string) => ["workouts", id] as const,
  exercises: ["exercises"] as const,
  exercise: (id: string) => ["exercises", id] as const,
  exercisesByIds: (ids: string[]) => ["exercises", "by-ids", ids.slice().sort()] as const,
  music: ["music"] as const,
  tracksByIds: (ids: string[]) => ["music", "by-ids", ids.slice()] as const,
  lastSync: ["lastSync"] as const,
};

export function useWorkouts() {
  return useQuery({
    queryKey: KEY.workouts,
    queryFn: () => listWorkouts(),
  });
}

export function useWorkout(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEY.workout(id) : ["workouts", "_undefined"],
    queryFn: () => (id ? getWorkout(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });
}

export function useExercises() {
  return useQuery({
    queryKey: KEY.exercises,
    queryFn: () => listExercises(),
  });
}

export function useExercise(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEY.exercise(id) : ["exercises", "_undefined"],
    queryFn: () => (id ? getExercise(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });
}

export function useExercisesByIds(ids: string[]) {
  return useQuery({
    queryKey: KEY.exercisesByIds(ids),
    queryFn: () => getExercisesByIds(ids),
    enabled: ids.length > 0,
  });
}

export function useMusic() {
  return useQuery({
    queryKey: KEY.music,
    queryFn: () => listMusic(),
  });
}

export function useTracksByIds(ids: string[]) {
  return useQuery({
    queryKey: KEY.tracksByIds(ids),
    queryFn: () => getTracksByIds(ids),
    enabled: ids.length > 0,
  });
}

export function useLastSync() {
  return useQuery({
    queryKey: KEY.lastSync,
    queryFn: () => getLastSync(),
  });
}

export function useSync() {
  const qc = useQueryClient();
  return useMutation<SyncResult>({
    mutationFn: () => runSync(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY.workouts });
      qc.invalidateQueries({ queryKey: KEY.exercises });
      qc.invalidateQueries({ queryKey: KEY.music });
      qc.invalidateQueries({ queryKey: KEY.lastSync });
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["exercises"] });
      qc.invalidateQueries({ queryKey: ["music"] });
    },
  });
}
