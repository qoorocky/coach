import { db, getMeta } from "../db";
import { fetchSync } from "../api/sync";

export interface SyncResult {
  exercisesUpdated: number;
  exercisesDeleted: number;
  workoutsUpdated: number;
  workoutsDeleted: number;
  musicUpdated: number;
  musicDeleted: number;
  serverTime: number;
}

const LAST_SYNC = "lastSync";
const MUSIC_CACHE = "coach-music-v1";

export async function getLastSync(): Promise<number> {
  return (await getMeta<number>(LAST_SYNC)) ?? 0;
}

export async function runSync(): Promise<SyncResult> {
  const since = await getLastSync();
  const res = await fetchSync(since);

  const d = await db();
  const tx = d.transaction(
    ["exercises", "workouts", "music", "meta"],
    "readwrite",
  );
  const exStore = tx.objectStore("exercises");
  const wkStore = tx.objectStore("workouts");
  const muStore = tx.objectStore("music");
  const metaStore = tx.objectStore("meta");

  for (const ex of res.exercises.updated) await exStore.put(ex);
  for (const id of res.exercises.deleted) await exStore.delete(id);
  for (const w of res.workouts.updated) await wkStore.put(w);
  for (const id of res.workouts.deleted) await wkStore.delete(id);
  for (const t of res.music.updated) await muStore.put(t);
  for (const id of res.music.deleted) await muStore.delete(id);
  await metaStore.put({ key: LAST_SYNC, value: res.serverTime });
  await tx.done;

  // Prefetch music files into Cache API in the background; deletions evict.
  void prefetchMusic(
    res.music.updated.map((t) => t.fileUrl),
    res.music.deleted,
  );

  return {
    exercisesUpdated: res.exercises.updated.length,
    exercisesDeleted: res.exercises.deleted.length,
    workoutsUpdated: res.workouts.updated.length,
    workoutsDeleted: res.workouts.deleted.length,
    musicUpdated: res.music.updated.length,
    musicDeleted: res.music.deleted.length,
    serverTime: res.serverTime,
  };
}

async function prefetchMusic(addUrls: string[], deletedIds: string[]): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(MUSIC_CACHE);

    if (deletedIds.length > 0) {
      // We only have ids here, not URLs; sweep the cache and drop any whose
      // path contains a deleted id. Cheap heuristic — file URLs include UUID.
      const reqs = await cache.keys();
      await Promise.all(
        reqs.map(async (req) => {
          if (deletedIds.some((id) => req.url.includes(id))) {
            await cache.delete(req);
          }
        }),
      );
    }

    await Promise.all(
      addUrls.map(async (url) => {
        const existing = await cache.match(url);
        if (existing) return;
        try {
          const res = await fetch(url, { mode: "cors", credentials: "omit" });
          if (res.ok) await cache.put(url, res.clone());
        } catch {
          // ignore network errors; we'll fall back to direct fetch later
        }
      }),
    );
  } catch {
    // ignore — Cache API not available or quota issue
  }
}
