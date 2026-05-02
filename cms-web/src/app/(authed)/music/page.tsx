"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { useDeleteMusic, useMusicList } from "@/lib/queries/music";

function formatDuration(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MusicListPage() {
  const [page, setPage] = useState(0);
  const size = 20;
  const query = useMusicList({ page, size });
  const del = useDeleteMusic();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">音樂庫</h1>
          <p className="text-sm text-muted-foreground">
            管理 HIIT 課程的背景音樂。PWA 在同步時會把 active 的曲目下載到本機。
          </p>
        </div>
        <Button render={<Link href="/music/new" />}>
          <Plus className="size-4" />
          新增音樂
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名稱</TableHead>
              <TableHead>藝人</TableHead>
              <TableHead>時長</TableHead>
              <TableHead>BPM</TableHead>
              <TableHead>授權</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isPending && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {query.data?.content.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  尚無音樂
                </TableCell>
              </TableRow>
            )}
            {query.data?.content.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <Link
                    href={`/music/${m.id}/edit`}
                    className="font-medium hover:underline"
                  >
                    {m.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{m.artist ?? "—"}</TableCell>
                <TableCell>{formatDuration(m.durationSec)}</TableCell>
                <TableCell>{m.bpm ?? "—"}</TableCell>
                <TableCell>{m.license}</TableCell>
                <TableCell>{m.active ? "啟用" : "停用"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent">
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/music/${m.id}/edit`} />}>
                        編輯
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={del.isPending}
                        onClick={() => {
                          if (!confirm(`確定刪除「${m.name}」？`)) return;
                          del.mutate(m.id, {
                            onSuccess: () => toast.success("已刪除"),
                            onError: (e) => toast.error((e as Error).message),
                          });
                        }}
                      >
                        刪除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {query.data && query.data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            共 {query.data.totalElements} 筆，第 {query.data.number + 1} / {query.data.totalPages} 頁
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={query.data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              上一頁
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={query.data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              下一頁
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
