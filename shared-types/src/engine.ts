import type { Workout } from './workout';
import type { SessionLog } from './session';

export type EngineState =
  | 'idle'
  | 'preparing'
  | 'exercising'
  | 'resting'
  | 'paused'
  | 'completed'
  | 'aborted';

export interface PausedContext {
  previousState: 'preparing' | 'exercising' | 'resting';
  remainingMs: number;
}

export interface WorkoutEngineState {
  workout: Workout;
  state: EngineState;
  currentSegmentIndex: number;
  currentRound: number;
  segmentStartTimestamp: number;
  segmentDurationMs: number;
  elapsedMs: number;
  remainingMs: number;
  pausedContext?: PausedContext;
  totalElapsedMs: number;
  currentHeartRate?: number;
  sessionLog: SessionLog;
}
