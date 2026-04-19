import type { Workout } from '@coach/shared-types';

const placeholderWorkout: Pick<Workout, 'name' | 'difficulty' | 'estimatedDurationSec'> = {
  name: '燃脂 20 分鐘 HIIT',
  difficulty: 'intermediate',
  estimatedDurationSec: 1200,
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8 dark:bg-zinc-950">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Coach CMS
      </h1>
      <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
        HIIT 內容管理後台（Phase 0 骨架）。首次發版請參照 spec.md §9。
      </p>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
          shared-types 連通測試
        </div>
        <pre className="text-zinc-900 dark:text-zinc-100">
{JSON.stringify(placeholderWorkout, null, 2)}
        </pre>
      </div>
    </main>
  );
}
