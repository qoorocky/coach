export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'obliques'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

export type Equipment =
  | 'none'
  | 'dumbbell'
  | 'mat'
  | 'kettlebell'
  | 'resistance_band';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  targetMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  videoUrl: string;
  videoLocalPath?: string;
  videoSizeBytes: number;
  thumbnailUrl: string;
  difficulty: Difficulty;
  equipment: Equipment[];
  version: number;
  updatedAt: number;
  createdAt: number;
}
