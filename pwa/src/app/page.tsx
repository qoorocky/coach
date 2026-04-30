export default function HomePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12 space-y-4">
      <h1 className="text-3xl font-semibold">Coach</h1>
      <p className="text-muted-foreground">HIIT 訓練應用，支援離線安裝。</p>
      <div className="rounded-md border bg-card p-4 text-sm">
        <p className="font-medium">Sprint A</p>
        <p className="text-muted-foreground mt-1">
          PWA scaffold 已就緒。下一步：把 cms-api 內容同步到本機 IndexedDB。
        </p>
      </div>
    </main>
  );
}
