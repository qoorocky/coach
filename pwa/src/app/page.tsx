import Link from "next/link";
import { AutoSync } from "@/components/AutoSync";
import { SyncStatus } from "@/components/SyncStatus";
import { WorkoutsHomeList } from "@/components/WorkoutsHomeList";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-8 space-y-6">
      <AutoSync />
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Coach</h1>
        <p className="text-sm text-muted-foreground">HIIT 訓練，支援離線。</p>
      </header>

      <SyncStatus />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">課程</h2>
          <Link
            href="/workouts"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            全部
          </Link>
        </div>
        <WorkoutsHomeList limit={5} />
      </section>

      <section>
        <Link
          href="/history"
          className="block rounded-lg border bg-card p-3 text-sm hover:bg-muted/30"
        >
          訓練紀錄 →
        </Link>
      </section>
    </main>
  );
}
