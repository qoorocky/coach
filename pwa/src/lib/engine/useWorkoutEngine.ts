"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Exercise,
  Workout,
  WorkoutMode,
  WorkoutSegment,
} from "@coach/shared-types";

import {
  beepCountdown,
  beepDone,
  beepRest,
  beepWorkStart,
  unlockAudio,
} from "./audio";
import { cancelSpeech, speak } from "./speech";

export interface Step {
  kind: "work" | "rest";
  durationMs: number;
  segIdx: number;
  roundIdx: number;
  totalRoundsInSeg: number;
}

export type Phase =
  | { kind: "idle" }
  | { kind: "prepare"; remainingMs: number }
  | {
      kind: "work" | "rest";
      remainingMs: number;
      segIdx: number;
      roundIdx: number;
      totalRoundsInSeg: number;
    }
  | { kind: "done" };

interface EngineApi {
  phase: Phase;
  workout: Workout;
  mode: WorkoutMode;
  segment: WorkoutSegment | null;
  exercise: Exercise | null;
  nextExercise: Exercise | null;
  totalElapsedMs: number;
  totalDurationMs: number;
  totalRemainingMs: number;
  amrapRound: number;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  stop: () => void;
}

const PREPARE_MS = 5_000;
const TICK_MS = 100;
const TABATA_WORK_MS = 20_000;
const TABATA_REST_MS = 10_000;
const TABATA_ROUNDS = 8;
const EMOM_MINUTE_MS = 60_000;

export function useWorkoutEngine(
  workout: Workout,
  exerciseMap: Map<string, Exercise> | undefined,
): EngineApi {
  const mode: WorkoutMode = workout.mode ?? "standard";
  const isAmrap = mode === "amrap";

  const steps = useMemo<Step[]>(() => {
    if (isAmrap) return amrapStepsLoop(workout);
    if (mode === "tabata") return expandTabata(workout);
    if (mode === "emom") return expandEmom(workout);
    return expandStandard(workout);
  }, [workout, mode, isAmrap]);

  const totalDurationMs = useMemo(() => {
    if (isAmrap) return Math.max(0, workout.estimatedDurationSec * 1000);
    return steps.reduce((acc, s) => acc + s.durationMs, 0);
  }, [steps, isAmrap, workout.estimatedDurationSec]);

  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [stepIdx, setStepIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsedMs, setTotalElapsedMs] = useState(0);

  const phaseRef = useRef<Phase>(phase);
  const pausedRef = useRef(false);
  const stepIdxRef = useRef(0);
  phaseRef.current = phase;
  pausedRef.current = isPaused;
  stepIdxRef.current = stepIdx;

  const totalRemainingMs = isAmrap
    ? Math.max(0, totalDurationMs - totalElapsedMs)
    : Math.max(0, totalDurationMs - totalElapsedMs);

  const amrapRound = useMemo(() => {
    if (!isAmrap || workout.segments.length === 0) return 0;
    return Math.floor(stepIdx / workout.segments.length) + (
      phase.kind === "work" || phase.kind === "rest" ? 1 : 0
    );
  }, [isAmrap, stepIdx, workout.segments.length, phase.kind]);

  const segment = useMemo<WorkoutSegment | null>(() => {
    if (phase.kind !== "work" && phase.kind !== "rest") return null;
    return workout.segments[phase.segIdx] ?? null;
  }, [phase, workout]);

  const exercise = useMemo<Exercise | null>(() => {
    if (!segment || !exerciseMap) return null;
    return exerciseMap.get(segment.exerciseId) ?? null;
  }, [segment, exerciseMap]);

  const nextExercise = useMemo<Exercise | null>(() => {
    if (phase.kind !== "work" && phase.kind !== "rest") return null;
    let cursor = stepIdx + 1;
    while (true) {
      if (!isAmrap && cursor >= steps.length) return null;
      const s = isAmrap
        ? amrapStepAt(workout, cursor)
        : steps[cursor];
      if (!s) return null;
      if (s.kind === "work") {
        const seg = workout.segments[s.segIdx];
        if (!seg) return null;
        return exerciseMap?.get(seg.exerciseId) ?? null;
      }
      cursor++;
      if (isAmrap && cursor > 1000) return null; // safety
    }
  }, [phase.kind, stepIdx, steps, isAmrap, workout, exerciseMap]);

  const enterStep = useCallback(
    (idx: number) => {
      const s = isAmrap ? amrapStepAt(workout, idx) : steps[idx];
      if (!s) {
        setPhase({ kind: "done" });
        beepDone();
        return;
      }
      if (s.kind === "work") {
        const seg = workout.segments[s.segIdx];
        if (seg) {
          const ex = exerciseMap?.get(seg.exerciseId);
          if (ex) speak(ex.name);
        }
        beepWorkStart();
      } else {
        beepRest();
      }
      setStepIdx(idx);
      setPhase({
        kind: s.kind,
        segIdx: s.segIdx,
        roundIdx: s.roundIdx,
        totalRoundsInSeg: s.totalRoundsInSeg,
        remainingMs: s.durationMs,
      });
    },
    [steps, workout, exerciseMap, isAmrap],
  );

  const advance = useCallback(() => {
    const next = stepIdxRef.current + 1;
    if (isAmrap && totalElapsedMs >= totalDurationMs) {
      setPhase({ kind: "done" });
      beepDone();
      return;
    }
    enterStep(next);
  }, [enterStep, isAmrap, totalElapsedMs, totalDurationMs]);

  // Tick loop
  useEffect(() => {
    if (phase.kind === "idle" || phase.kind === "done") return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const cur = phaseRef.current;
      if (cur.kind === "idle" || cur.kind === "done") return;

      const next = cur.remainingMs - TICK_MS;

      // AMRAP: stop when total clock runs out, regardless of phase
      if (isAmrap && cur.kind !== "prepare") {
        const newElapsed = totalElapsedMs + TICK_MS;
        if (newElapsed >= totalDurationMs) {
          setTotalElapsedMs(totalDurationMs);
          setPhase({ kind: "done" });
          beepDone();
          return;
        }
      }

      if (next > 0) {
        const prevSec = Math.ceil(cur.remainingMs / 1000);
        const nextSec = Math.ceil(next / 1000);
        if (prevSec !== nextSec && nextSec > 0 && nextSec <= 3) {
          beepCountdown();
        }
        setPhase({ ...cur, remainingMs: next });
        setTotalElapsedMs((t) => t + TICK_MS);
        return;
      }

      setTotalElapsedMs((t) => t + cur.remainingMs);
      if (cur.kind === "prepare") {
        enterStep(0);
        return;
      }
      advance();
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase.kind, isAmrap, totalDurationMs, totalElapsedMs, enterStep, advance]);

  const start = useCallback(() => {
    unlockAudio();
    setStepIdx(0);
    setTotalElapsedMs(0);
    setPhase({ kind: "prepare", remainingMs: PREPARE_MS });
    speak("準備開始");
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    cancelSpeech();
  }, []);

  const resume = useCallback(() => {
    unlockAudio();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    cancelSpeech();
    setIsPaused(false);
    setStepIdx(0);
    setPhase({ kind: "idle" });
    setTotalElapsedMs(0);
  }, []);

  const skip = useCallback(() => {
    const cur = phaseRef.current;
    if (cur.kind === "prepare") {
      enterStep(0);
      return;
    }
    if (cur.kind === "work" || cur.kind === "rest") {
      advance();
    }
  }, [enterStep, advance]);

  return {
    phase,
    workout,
    mode,
    segment,
    exercise,
    nextExercise,
    totalElapsedMs,
    totalDurationMs,
    totalRemainingMs,
    amrapRound,
    isPaused,
    start,
    pause,
    resume,
    skip,
    stop,
  };
}

function expandStandard(workout: Workout): Step[] {
  const out: Step[] = [];
  workout.segments.forEach((seg, segIdx) => {
    const rounds = Math.max(1, seg.rounds);
    for (let r = 0; r < rounds; r++) {
      out.push({
        kind: "work",
        durationMs: seg.durationSec * 1000,
        segIdx,
        roundIdx: r,
        totalRoundsInSeg: rounds,
      });
      if (seg.restAfterSec > 0) {
        out.push({
          kind: "rest",
          durationMs: seg.restAfterSec * 1000,
          segIdx,
          roundIdx: r,
          totalRoundsInSeg: rounds,
        });
      }
    }
  });
  return out;
}

function expandTabata(workout: Workout): Step[] {
  const out: Step[] = [];
  workout.segments.forEach((_, segIdx) => {
    for (let r = 0; r < TABATA_ROUNDS; r++) {
      out.push({
        kind: "work",
        durationMs: TABATA_WORK_MS,
        segIdx,
        roundIdx: r,
        totalRoundsInSeg: TABATA_ROUNDS,
      });
      out.push({
        kind: "rest",
        durationMs: TABATA_REST_MS,
        segIdx,
        roundIdx: r,
        totalRoundsInSeg: TABATA_ROUNDS,
      });
    }
  });
  return out;
}

function expandEmom(workout: Workout): Step[] {
  const out: Step[] = [];
  workout.segments.forEach((seg, segIdx) => {
    const rounds = Math.max(1, seg.rounds);
    for (let r = 0; r < rounds; r++) {
      out.push({
        kind: "work",
        durationMs: EMOM_MINUTE_MS,
        segIdx,
        roundIdx: r,
        totalRoundsInSeg: rounds,
      });
    }
  });
  return out;
}

function amrapStepsLoop(_workout: Workout): Step[] {
  // AMRAP doesn't use a fixed step list; engine queries amrapStepAt by index
  return [];
}

function amrapStepAt(workout: Workout, idx: number): Step | null {
  if (workout.segments.length === 0) return null;
  const segIdx = idx % workout.segments.length;
  const seg = workout.segments[segIdx];
  if (!seg) return null;
  return {
    kind: "work",
    durationMs: seg.durationSec * 1000,
    segIdx,
    roundIdx: 0,
    totalRoundsInSeg: 1,
  };
}
