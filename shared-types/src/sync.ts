import type { Exercise } from './exercise';
import type { MusicTrack, Workout } from './workout';

export interface SyncRequest {
  since: number;
}

export interface SyncResponse {
  serverTime: number;
  exercises: {
    updated: Exercise[];
    deleted: string[];
  };
  workouts: {
    updated: Workout[];
    deleted: string[];
  };
  music: {
    updated: MusicTrack[];
    deleted: string[];
  };
  hasMore: boolean;
}
