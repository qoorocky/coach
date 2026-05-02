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
  trackIds: string[];
  createdBy: 'system' | 'user';
  version: number;
  updatedAt: number;
  createdAt: number;
}

export interface MusicTrack {
  id: string;
  name: string;
  artist: string | null;
  bpm: number | null;
  durationSec: number;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  updatedAt: number;
  createdAt: number;
}
