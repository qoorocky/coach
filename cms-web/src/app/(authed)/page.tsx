"use client";

import Link from "next/link";

import { useAuthStore } from "@/lib/auth/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/lifecycle/StatusBadge";
import { useExercises } from "@/lib/queries/exercises";
import { useWorkouts } from "@/lib/queries/workouts";
import { STATUS_OPTIONS } from "@/lib/domain/types";
import type { ContentStatus } from "@/lib/domain/types";

const STATUS_DESCRIPTIONS: Record<ContentStatus, string> = {
  DRAFT: "編輯中尚未送審",
  IN_REVIEW: "等待審核",
  PUBLISHED: "已上線",
  ARCHIVED: "已下架",
};

const STATUSES: ContentStatus[] = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];

function statusLabel(status: ContentStatus) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("zh-Hant", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function ExerciseStatusCard({ status }: { status: ContentStatus }) {
  const query = useExercises({ status, page: 0, size: 1 });
  const isReview = status === "IN_REVIEW";

  const inner = (
    <Card size="sm" className={isReview ? "transition-colors hover:bg-accent" : undefined}>
      <CardHeader>
        <CardDescription>{statusLabel(status)}</CardDescription>
        <CardTitle className="text-2xl">
          {query.isPending ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            (query.data?.totalElements ?? 0)
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {STATUS_DESCRIPTIONS[status]}
      </CardContent>
    </Card>
  );

  if (isReview) {
    return (
      <Link href="/review" className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function WorkoutStatusCard({ status }: { status: ContentStatus }) {
  const query = useWorkouts({ status, page: 0, size: 1 });
  const isReview = status === "IN_REVIEW";

  const inner = (
    <Card size="sm" className={isReview ? "transition-colors hover:bg-accent" : undefined}>
      <CardHeader>
        <CardDescription>{statusLabel(status)}</CardDescription>
        <CardTitle className="text-2xl">
          {query.isPending ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            (query.data?.totalElements ?? 0)
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {STATUS_DESCRIPTIONS[status]}
      </CardContent>
    </Card>
  );

  if (isReview) {
    return (
      <Link href="/review" className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function RecentExercises() {
  const query = useExercises({ page: 0, size: 5 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近動作</CardTitle>
        <CardDescription>最新 5 筆動作</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {query.isPending && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </>
        )}
        {!query.isPending && (query.data?.content.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">目前沒有資料</p>
        )}
        {query.data?.content.map((ex) => (
          <Link
            key={ex.id}
            href={`/exercises/${ex.id}`}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-accent"
          >
            <span className="font-medium truncate">{ex.nameZh}</span>
            <span className="flex items-center gap-2 shrink-0">
              <StatusBadge status={ex.status} />
              <span className="text-xs text-muted-foreground">
                {formatDate(ex.updatedAt)}
              </span>
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentWorkouts() {
  const query = useWorkouts({ page: 0, size: 5 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近課程</CardTitle>
        <CardDescription>最新 5 筆課程</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {query.isPending && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </>
        )}
        {!query.isPending && (query.data?.content.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">目前沒有資料</p>
        )}
        {query.data?.content.map((wk) => (
          <Link
            key={wk.id}
            href={`/workouts/${wk.id}`}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-accent"
          >
            <span className="font-medium truncate">{wk.name}</span>
            <span className="flex items-center gap-2 shrink-0">
              <StatusBadge status={wk.status} />
              <span className="text-xs text-muted-foreground">
                {formatDate(wk.updatedAt)}
              </span>
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function todayLabel() {
  const d = new Date();
  const date = d.toLocaleDateString("zh-Hant", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekday = d.toLocaleDateString("zh-Hant", { weekday: "long" });
  return `${date} · ${weekday}`;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[24px] font-bold text-foreground tracking-tight">
          儀表板
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {todayLabel()} · 你好，{user?.name ?? "管理員"}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">動作狀態</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATUSES.map((s) => (
            <ExerciseStatusCard key={s} status={s} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">課程狀態</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATUSES.map((s) => (
            <WorkoutStatusCard key={s} status={s} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <RecentExercises />
        <RecentWorkouts />
      </section>
    </div>
  );
}
