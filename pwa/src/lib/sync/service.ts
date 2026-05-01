import { db, getMeta, setMeta } from "../db";
import { fetchSync } from "../api/sync";

export interface SyncResult {
  exercisesUpdated: number;
  exercisesDeleted: number;
  workoutsUpdated: number;
  workoutsDeleted: number;
  serverTime: number;
}

const LAST_SYNC = "lastSync";

export async function getLastSync(): Promise<number> {
  return (await getMeta<number>(LAST_SYNC)) ?? 0;
}

export async function runSync(): Promise<SyncResult> {
  const since = await getLastSync();
  const res = await fetchSync(since);

  const d = await db();
  const tx = d.transaction(["exercises", "workouts", "meta"], "readwrite");
  const exStore = tx.objectStore("exercises");
  const wkStore = tx.objectStore("workouts");
  const metaStore = tx.objectStore("meta");

  for (const ex of res.exercises.updated) await exStore.put(ex);
  for (const id of res.exercises.deleted) await exStore.delete(id);
  for (const w of res.workouts.updated) await wkStore.put(w);
  for (const id of res.workouts.deleted) await wkStore.delete(id);
  await metaStore.put({ key: LAST_SYNC, value: res.serverTime });
  await tx.done;

  return {
    exercisesUpdated: res.exercises.updated.length,
    exercisesDeleted: res.exercises.deleted.length,
    workoutsUpdated: res.workouts.updated.length,
    workoutsDeleted: res.workouts.deleted.length,
    serverTime: res.serverTime,
  };
}
