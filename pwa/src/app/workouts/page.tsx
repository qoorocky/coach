"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { WorkoutCard } from "@/components/WorkoutCard";
import { useWorkouts } from "@/lib/queries/content";

export default function WorkoutsListPage() {
  const { data, isPending } = useWorkouts();

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        首頁
      </Link>
      <h1 className="text-2xl font-semibold">所有課程</h1>

      {isPending && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {!isPending && (data?.length ?? 0) === 0 && (
        <p className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
          尚未同步到課程。
        </p>
      )}

      {!isPending && (data?.length ?? 0) > 0 && (
        <ul className="space-y-2">
          {[...(data ?? [])]
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((w) => (
              <li key={w.id}>
                <WorkoutCard workout={w} />
              </li>
            ))}
        </ul>
      )}
    </main>
  );
}
