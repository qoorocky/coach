"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { StatusBadge } from "@/components/lifecycle/StatusBadge";

import { useDeleteExercise, useExercises } from "@/lib/queries/exercises";
import { DIFFICULTY_OPTIONS } from "@/lib/domain/types";
import type { ContentStatus } from "@/lib/domain/types";

const FILTER_OPTIONS: { value: "ALL" | ContentStatus; label: string }[] = [
  { value: "ALL", label: "全部" },
  { value: "DRAFT", label: "草稿" },
  { value: "IN_REVIEW", label: "審核中" },
  { value: "PUBLISHED", label: "已發布" },
  { value: "ARCHIVED", label: "已封存" },
];

export default function ExercisesListPage() {
  const [filter, setFilter] = useState<"ALL" | ContentStatus>("ALL");
  const [page, setPage] = useState(0);
  const size = 20;

  const params = {
    status: filter === "ALL" ? undefined : filter,
    page,
    size,
  };
  const query = useExercises(params);
  const del = useDeleteExercise();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">動作管理</h1>
          <p className="text-sm text-muted-foreground">建立、編輯、送審動作。</p>
        </div>
        <Button render={<Link href="/exercises/new" />}>
          <Plus className="size-4" />
          新增動作
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={filter}
          onValueChange={(v) => {
            setFilter(v as typeof filter);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名稱 (中)</TableHead>
              <TableHead>名稱 (英)</TableHead>
              <TableHead>難度</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>版本</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isPending && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {query.data?.content.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  沒有資料
                </TableCell>
              </TableRow>
            )}
            {query.data?.content.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell>
                  <Link
                    href={`/exercises/${ex.id}`}
                    className="font-medium hover:underline"
                  >
                    {ex.nameZh}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{ex.nameEn}</TableCell>
                <TableCell>
                  {DIFFICULTY_OPTIONS.find((o) => o.value === ex.difficulty)?.label ??
                    ex.difficulty}
                </TableCell>
                <TableCell>
                  <StatusBadge status={ex.status} />
                </TableCell>
                <TableCell>v{ex.currentVersion}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent">
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/exercises/${ex.id}`} />}>
                        檢視
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href={`/exercises/${ex.id}/edit`} />}>
                        編輯
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={ex.status !== "DRAFT" || del.isPending}
                        onClick={() => {
                          if (!confirm(`確定刪除「${ex.nameZh}」？`)) return;
                          del.mutate(ex.id, {
                            onSuccess: () => toast.success("已刪除"),
                            onError: (e) => toast.error((e as Error).message),
                          });
                        }}
                      >
                        刪除 (僅草稿)
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
