"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ExerciseLifecycleActions } from "@/components/lifecycle/ExerciseLifecycleActions";
import { WorkoutLifecycleActions } from "@/components/lifecycle/WorkoutLifecycleActions";

import { useExercises } from "@/lib/queries/exercises";
import { useWorkouts } from "@/lib/queries/workouts";
import { DIFFICULTY_OPTIONS } from "@/lib/domain/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

function difficultyLabel(value: string): string {
  return DIFFICULTY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export default function ReviewQueuePage() {
  const exercises = useExercises({ status: "IN_REVIEW", page: 0, size: 100 });
  const workouts = useWorkouts({ status: "IN_REVIEW", page: 0, size: 100 });

  const exCount = exercises.data?.content.length ?? 0;
  const wkCount = workouts.data?.content.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">待審核</h1>
        <p className="text-sm text-muted-foreground">
          檢視所有送審中的動作與課程，核准發布或退回修改。
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">動作 ({exCount})</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱 (中)</TableHead>
                <TableHead>名稱 (英)</TableHead>
                <TableHead>難度</TableHead>
                <TableHead>送審時間</TableHead>
                <TableHead className="w-[280px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.isPending && (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!exercises.isPending && exCount === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    目前沒有待審核項目
                  </TableCell>
                </TableRow>
              )}
              {exercises.data?.content.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell>
                    <Link
                      href={`/exercises/${ex.id}`}
                      className="font-medium hover:underline"
                    >
                      {ex.nameZh}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ex.nameEn}
                  </TableCell>
                  <TableCell>{difficultyLabel(ex.difficulty)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(ex.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <ExerciseLifecycleActions id={ex.id} status={ex.status} />
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/exercises/${ex.id}`} />}
                      >
                        檢視
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">課程 ({wkCount})</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead>難度</TableHead>
                <TableHead>Segments</TableHead>
                <TableHead>送審時間</TableHead>
                <TableHead className="w-[280px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.isPending && (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!workouts.isPending && wkCount === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    目前沒有待審核項目
                  </TableCell>
                </TableRow>
              )}
              {workouts.data?.content.map((wk) => (
                <TableRow key={wk.id}>
                  <TableCell>
                    <Link
                      href={`/workouts/${wk.id}`}
                      className="font-medium hover:underline"
                    >
                      {wk.name}
                    </Link>
                  </TableCell>
                  <TableCell>{difficultyLabel(wk.difficulty)}</TableCell>
                  <TableCell>{wk.segments.length}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(wk.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <WorkoutLifecycleActions id={wk.id} status={wk.status} />
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/workouts/${wk.id}`} />}
                      >
                        檢視
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
