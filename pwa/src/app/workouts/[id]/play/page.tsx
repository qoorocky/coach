"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Music, Pause, Play, SkipForward, Square } from "lucide-react";
import type { Workout } from "@coach/shared-types";

import { useExercisesByIds, useTracksByIds, useWorkout } from "@/lib/queries/content";
import { useWorkoutEngine, type Phase } from "@/lib/engine/useWorkoutEngine";
import { useWakeLock } from "@/lib/engine/wakeLock";
import { useMusicPlayer } from "@/lib/engine/music";
import { useSaveSession } from "@/lib/queries/sessions";

interface Props {
  params: Promise<{ id: string }>;
}

function formatMmSs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function phaseTone(p: Phase): { bg: string; label: string } {
  if (p.kind === "prepare") return { bg: "bg-amber-500", label: "準備" };
  if (p.kind === "work") return { bg: "bg-emerald-600", label: "進行中" };
  if (p.kind === "rest") return { bg: "bg-sky-600", label: "休息" };
  if (p.kind === "done") return { bg: "bg-zinc-700", label: "完成" };
  return { bg: "bg-zinc-800", label: "待開始" };
}

// Outer: only does query + guards. No engine hook here, so workout being
// undefined during the loading state can never reach `useWorkoutEngine`.
export default function PlayWorkoutPage({ params }: Props) {
  const { id } = use(params);
  const { data: workout, isPending } = useWorkout(id);

  if (isPending) {
    return (
      <main className="mx-auto max-w-md px-4 py-6 space-y-3">
        <div className="h-6 w-24 rounded bg-muted animate-pulse" />
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      </main>
    );
  }

  if (!workout) {
    return (
      <main className="mx-auto max-w-md px-4 py-6 space-y-3">
        <Link
          href="/workouts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          回列表
        </Link>
        <h1 className="text-xl font-semibold">找不到課程</h1>
      </main>
    );
  }

  return <PlayInner workout={workout} />;
}

// Inner: workout is guaranteed non-null. Engine + all effects live here so
// they obey the rules of hooks (called unconditionally on every render of this
// component, which only mounts once the workout exists).
function PlayInner({ workout }: { workout: Workout }) {
  const router = useRouter();
  const exerciseIds = workout.segments.map((s) => s.exerciseId);
  const { data: exerciseMap } = useExercisesByIds(exerciseIds);

  const engine = useWorkoutEngine(workout, exerciseMap);
  const isLive =
    engine.phase.kind !== "idle" && engine.phase.kind !== "done";
  useWakeLock(isLive && !engine.isPaused);

  const trackIds = workout.trackIds;
  const { data: tracks = [] } = useTracksByIds(trackIds);
  const music = useMusicPlayer(tracks);

  // Drive music from engine state
  const prevPhaseRef = useRef<Phase["kind"]>("idle");
  useEffect(() => {
    const prev = prevPhaseRef.current;
    const cur = engine.phase.kind;
    if (cur === "prepare" && prev === "idle") music.start();
    if (cur === "done") music.stop();
    if (cur === "idle" && prev !== "idle") music.stop();
    prevPhaseRef.current = cur;
  }, [engine.phase.kind, music]);

  useEffect(() => {
    if (!isLive) return;
    if (engine.isPaused) music.pause();
    else if (music.currentTrack && !music.isPlaying) music.resume();
    // intentionally ignore music.* identity changes; only react to pause flag
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.isPaused, isLive]);

  const [startedAt, setStartedAt] = useState<number | null>(null);
  useEffect(() => {
    if (engine.phase.kind === "prepare" && startedAt === null) {
      setStartedAt(Date.now());
    }
    if (engine.phase.kind === "idle" && startedAt !== null) {
      setStartedAt(null);
    }
  }, [engine.phase.kind, startedAt]);

  const saveSession = useSaveSession();
  const savedRef = useRef(false);
  useEffect(() => {
    if (
      engine.phase.kind === "done" &&
      !savedRef.current &&
      startedAt !== null
    ) {
      savedRef.current = true;
      const now = Date.now();
      saveSession.mutate({
        sessionId: crypto.randomUUID(),
        workoutId: workout.id,
        startedAt,
        endedAt: now,
        completedSegments: [],
        heartRateSamples: [],
        wasCompleted: true,
        totalElapsedMs: engine.totalElapsedMs,
        workoutSnapshot: workout,
      });
    }
  }, [engine.phase.kind, workout, startedAt, engine.totalElapsedMs, saveSession]);

  const tone = phaseTone(engine.phase);
  const remainingMs =
    engine.phase.kind === "idle" || engine.phase.kind === "done"
      ? 0
      : engine.phase.remainingMs;
  const totalProgressPct =
    engine.totalDurationMs === 0
      ? 0
      : Math.min(100, (engine.totalElapsedMs / engine.totalDurationMs) * 100);

  return (
    <main className={`min-h-screen text-white transition-colors ${tone.bg}`}>
      <div className="mx-auto max-w-md px-5 py-6 flex min-h-screen flex-col">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (
                isLive &&
                !confirm("確定結束此次訓練？目前進度不會儲存。")
              ) {
                return;
              }
              engine.stop();
              router.push(`/workouts/${workout.id}`);
            }}
            className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white"
          >
            <ChevronLeft className="size-4" />
            結束
          </button>
          <span className="text-xs text-white/85">{tone.label}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          {engine.phase.kind === "idle" && (
            <>
              <h1 className="text-3xl font-semibold">{workout.name}</h1>
              <p className="text-white/80 text-sm">
                {workout.segments.length} segments · 預估{" "}
                {Math.round(engine.totalDurationMs / 60000)} 分
              </p>
              <button
                type="button"
                onClick={engine.start}
                className="rounded-full text-white font-bold text-lg px-12 py-4 shadow-lg"
                style={{ background: "var(--primary-grad)" }}
              >
                開始
              </button>
            </>
          )}

          {engine.phase.kind === "prepare" && (
            <>
              <p className="text-sm text-white/85 uppercase tracking-wider">
                準備
              </p>
              <p className="text-9xl font-bold tabular-nums">
                {Math.ceil(remainingMs / 1000)}
              </p>
              <p className="text-base text-white/85">
                即將開始：{engine.workout.segments[0]
                  ? exerciseMap?.get(engine.workout.segments[0].exerciseId)
                      ?.name ?? "-"
                  : "-"}
              </p>
            </>
          )}

          {(engine.phase.kind === "work" ||
            engine.phase.kind === "rest") &&
            engine.mode !== "amrap" && (
            <>
              <p className="text-xs text-white/80">
                段落 {engine.phase.segIdx + 1} / {workout.segments.length} ·
                回合 {engine.phase.roundIdx + 1} /{" "}
                {engine.phase.totalRoundsInSeg}
              </p>
              <h1 className="text-3xl font-semibold">
                {engine.phase.kind === "rest"
                  ? "休息"
                  : engine.exercise?.name ?? "-"}
              </h1>
              <p className="text-9xl font-bold tabular-nums">
                {formatMmSs(remainingMs)}
              </p>
              {engine.nextExercise && (
                <p className="text-sm text-white/80">
                  下一個：{engine.nextExercise.name}
                </p>
              )}
            </>
          )}

          {(engine.phase.kind === "work" ||
            engine.phase.kind === "rest") &&
            engine.mode === "amrap" && (
            <>
              <p className="text-xs text-white/80">
                AMRAP · 第 {engine.amrapRound} 輪
              </p>
              <h1 className="text-3xl font-semibold">
                {engine.exercise?.name ?? "-"}
              </h1>
              <p className="text-9xl font-bold tabular-nums">
                {formatMmSs(engine.totalRemainingMs)}
              </p>
              <p className="text-sm text-white/80">
                本動作剩 {formatMmSs(remainingMs)}
              </p>
              {engine.nextExercise && (
                <p className="text-sm text-white/70">
                  下一個：{engine.nextExercise.name}
                </p>
              )}
            </>
          )}

          {engine.phase.kind === "done" && (
            <>
              <h1 className="text-3xl font-semibold">完成 ✓</h1>
              <p className="text-white/85">
                總時間 {formatMmSs(engine.totalElapsedMs)}
              </p>
              <button
                type="button"
                onClick={() => router.push(`/workouts/${workout.id}`)}
                className="rounded-full text-white font-bold text-base px-10 py-3 shadow-lg"
                style={{ background: "var(--primary-grad)" }}
              >
                返回課程
              </button>
            </>
          )}
        </div>

        {isLive && (
          <div className="space-y-4">
            {tracks.length > 0 && music.currentTrack && (
              <div className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs">
                <Music className="size-4 shrink-0" />
                <div className="flex-1 min-w-0 truncate">
                  <span className="font-medium">{music.currentTrack.name}</span>
                  {music.currentTrack.artist && (
                    <span className="text-white/70"> · {music.currentTrack.artist}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => (music.isPlaying ? music.pause() : music.resume())}
                  className="rounded p-1 hover:bg-white/15"
                  aria-label={music.isPlaying ? "暫停音樂" : "播放音樂"}
                >
                  {music.isPlaying ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={music.next}
                  className="rounded p-1 hover:bg-white/15"
                  aria-label="下一首"
                  disabled={tracks.length < 2}
                >
                  <SkipForward className="size-4" />
                </button>
              </div>
            )}

            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${totalProgressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-around">
              {engine.isPaused ? (
                <ControlButton onClick={engine.resume} label="繼續">
                  <Play className="size-6" />
                </ControlButton>
              ) : (
                <ControlButton onClick={engine.pause} label="暫停">
                  <Pause className="size-6" />
                </ControlButton>
              )}
              <ControlButton onClick={engine.skip} label="跳過">
                <SkipForward className="size-6" />
              </ControlButton>
              <ControlButton
                onClick={() => {
                  if (confirm("確定結束此次訓練？")) {
                    engine.stop();
                    router.push(`/workouts/${workout.id}`);
                  }
                }}
                label="結束"
              >
                <Square className="size-6" />
              </ControlButton>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 size-16 justify-center"
      aria-label={label}
    >
      {children}
      <span className="text-[10px] text-white/85">{label}</span>
    </button>
  );
}
