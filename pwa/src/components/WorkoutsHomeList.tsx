"use client";

import { WorkoutCard } from "./WorkoutCard";
import { useWorkouts } from "@/lib/queries/content";

export function WorkoutsHomeList({ limit }: { limit?: number }) {
  const { data, isPending } = useWorkouts();

  if (isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  const items = data ?? [];
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
        尚未同步到課程，請等待同步完成或點上方「立即同步」。
      </p>
    );
  }

  const sorted = [...items].sort((a, b) => b.updatedAt - a.updatedAt);
  const shown = limit ? sorted.slice(0, limit) : sorted;

  return (
    <ul className="space-y-2">
      {shown.map((w) => (
        <li key={w.id}>
          <WorkoutCard workout={w} />
        </li>
      ))}
    </ul>
  );
}
