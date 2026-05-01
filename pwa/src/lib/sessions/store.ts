import { db } from "../db";
import type { StoredSession } from "./types";

export async function saveSession(session: StoredSession): Promise<void> {
  const d = await db();
  await d.put("sessions", session);
}

export async function listSessions(): Promise<StoredSession[]> {
  const d = await db();
  const tx = d.transaction("sessions", "readonly");
  const idx = tx.store.index("by-startedAt");
  const out: StoredSession[] = [];
  let cursor = await idx.openCursor(null, "prev");
  while (cursor) {
    out.push(cursor.value);
    cursor = await cursor.continue();
  }
  return out;
}

export async function getSession(id: string): Promise<StoredSession | undefined> {
  const d = await db();
  return d.get("sessions", id);
}

export async function deleteSession(id: string): Promise<void> {
  const d = await db();
  await d.delete("sessions", id);
}
