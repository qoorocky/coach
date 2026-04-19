export interface CompletedSegment {
  segmentId: string;
  orderIndex: number;
  actualDurationMs: number;
  wasSkipped: boolean;
}

export interface HeartRateSample {
  timestamp: number;
  bpm: number;
}

export interface SessionLog {
  sessionId: string;
  workoutId: string;
  startedAt: number;
  endedAt?: number;
  completedSegments: CompletedSegment[];
  heartRateSamples: HeartRateSample[];
  wasCompleted: boolean;
  avgHeartRate?: number;
  maxHeartRate?: number;
  estimatedCalories?: number;
  subjectiveRating?: 1 | 2 | 3 | 4;
  notes?: string;
}
