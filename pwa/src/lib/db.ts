import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Exercise, Workout } from "@coach/shared-types";

interface CoachDB extends DBSchema {
  exercises: { key: string; value: Exercise };
  workouts: { key: string; value: Workout };
  meta: { key: string; value: { key: string; value: unknown } };
}

let dbPromise: Promise<IDBPDatabase<CoachDB>> | null = null;

export function db(): Promise<IDBPDatabase<CoachDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CoachDB>("coach", 1, {
      upgrade(d) {
        d.createObjectStore("exercises", { keyPath: "id" });
        d.createObjectStore("workouts", { keyPath: "id" });
        d.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const d = await db();
  const row = await d.get("meta", key);
  return row?.value as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const d = await db();
  await d.put("meta", { key, value });
}

export async function listWorkouts(): Promise<Workout[]> {
  const d = await db();
  return d.getAll("workouts");
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  const d = await db();
  return d.get("workouts", id);
}

export async function listExercises(): Promise<Exercise[]> {
  const d = await db();
  return d.getAll("exercises");
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  const d = await db();
  return d.get("exercises", id);
}

export async function getExercisesByIds(ids: string[]): Promise<Map<string, Exercise>> {
  const d = await db();
  const tx = d.transaction("exercises", "readonly");
  const out = new Map<string, Exercise>();
  await Promise.all(
    ids.map(async (id) => {
      const ex = await tx.store.get(id);
      if (ex) out.set(id, ex);
    }),
  );
  await tx.done;
  return out;
}
