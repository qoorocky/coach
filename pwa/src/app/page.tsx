"use client";

import Link from "next/link";
import { Clock, Flame } from "lucide-react";
import { AutoSync } from "@/components/AutoSync";
import { SyncStatus } from "@/components/SyncStatus";
import { CoachLogo } from "@/components/CoachLogo";
import { BottomNav } from "@/components/BottomNav";
import { WorkoutsHomeList } from "@/components/WorkoutsHomeList";
import { useWorkouts } from "@/lib/queries/content";

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "高級",
};

export default function HomePage() {
  const { data } = useWorkouts();
  const featured = (data ?? [])
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];

  return (
    <main className="mx-auto max-w-md px-5 pt-6 has-bottom-nav">
      <AutoSync />

      <header className="flex items-center justify-between mb-5">
        <CoachLogo size={22} />
        <SyncStatus />
      </header>

      {featured && (
        <Link
          href={`/workouts/${featured.id}`}
          className="block rounded-xl overflow-hidden relative h-[180px] mb-6"
          style={{
            background: featured.coverImageUrl
              ? `url(${featured.coverImageUrl}) center/cover`
              : "linear-gradient(135deg, #1c1c1f 0%, #27272a 60%, #1c1c1f 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "var(--primary-grad)", opacity: 0.18 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--hero-grad)" }}
          />
          <div className="absolute top-4 right-4">
            <span
              className="text-[11px] font-bold px-3 py-1 rounded-full"
              style={{ background: "var(--primary-grad)", color: "#fff" }}
            >
              最新課程
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2 mb-2">
              <span
                className="text-[11px] px-2.5 py-[3px] rounded-full text-white backdrop-blur-md"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {featured.mode.toUpperCase()}
              </span>
              <span
                className="text-[11px] px-2.5 py-[3px] rounded-full text-white backdrop-blur-md"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {DIFFICULTY_LABEL[featured.difficulty] ?? featured.difficulty}
              </span>
            </div>
            <p className="text-xl font-extrabold text-white mb-1.5 truncate">
              {featured.name}
            </p>
            <div className="flex items-center gap-3 text-xs text-white/75">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {Math.round(featured.estimatedDurationSec / 60)} 分
              </span>
              <span className="inline-flex items-center gap-1">
                <Flame className="size-3.5" />
                {featured.estimatedCalories} kcal
              </span>
              <span className="ml-auto text-primary text-sm font-bold">
                開始 →
              </span>
            </div>
          </div>
        </Link>
      )}

      <section className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold">所有課程</h2>
          <Link
            href="/workouts"
            className="text-xs text-primary hover:opacity-80"
          >
            查看全部
          </Link>
        </div>
        <WorkoutsHomeList limit={5} />
      </section>

      <BottomNav />
    </main>
  );
}
