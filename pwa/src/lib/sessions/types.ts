import type { SessionLog, Workout } from "@coach/shared-types";

export interface StoredSession extends SessionLog {
  workoutSnapshot: Workout;
  totalElapsedMs: number;
}
