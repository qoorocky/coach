import type { EngineState, Workout } from '@coach/shared-types';

describe('shared-types integration', () => {
  it('imports EngineState literal union from @coach/shared-types', () => {
    const state: EngineState = 'idle';
    expect(state).toBe('idle');
  });

  it('accepts a Workout-shaped object', () => {
    const workout: Pick<Workout, 'id' | 'name' | 'difficulty'> = {
      id: 'W01',
      name: '新手入門 8 分鐘',
      difficulty: 'beginner',
    };
    expect(workout.difficulty).toBe('beginner');
  });
});
