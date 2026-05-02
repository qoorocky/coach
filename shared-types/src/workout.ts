import type { Difficulty } from './exercise';

export type WorkoutMode = 'standard' | 'tabata' | 'emom' | 'amrap';

export interface WorkoutSegment {
  segmentId: string;
  exerciseId: string;
  orderIndex: number;
  durationSec: number;
  restAfterSec: number;
  rounds: number;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  difficulty: Difficulty;
  mode: WorkoutMode;
  estimatedDurationSec: number;
  estimatedCalories: number;
  segments: WorkoutSegment[];
  tags: string[];
  createdBy: 'system' | 'user';
  version: number;
  updatedAt: number;
  createdAt: number;
}
