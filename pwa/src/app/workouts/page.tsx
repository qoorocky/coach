"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { CoachLogo } from "@/components/CoachLogo";
import { WorkoutCard } from "@/components/WorkoutCard";
import { useWorkouts } from "@/lib/queries/content";

export default function WorkoutsListPage() {
  const { data, isPending } = useWorkouts();
  const items = (data ?? []).slice().sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <main className="mx-auto max-w-md px-5 pt-6 has-bottom-nav">
      <header className="flex items-center justify-between mb-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-sub hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          首頁
        </Link>
        <CoachLogo size={13} dim />
      </header>
      <h1 className="text-xl font-bold mb-1">所有課程</h1>
      <p className="text-xs text-dim mb-5">
        {isPending ? "載入中…" : `${items.length} 堂課程`}
      </p>

      {isPending && (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass h-[78px] rounded animate-pulse" />
          ))}
        </div>
      )}

      {!isPending && items.length === 0 && (
        <p className="rounded border border-dashed border-border bg-card/40 p-6 text-center text-sm text-sub">
          尚未同步到課程。
        </p>
      )}

      {!isPending && items.length > 0 && (
        <ul className="space-y-2.5">
          {items.map((w) => (
            <li key={w.id}>
              <WorkoutCard workout={w} />
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
