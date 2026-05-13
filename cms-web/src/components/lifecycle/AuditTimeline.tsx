"use client";

import {
  CheckCircle2,
  Clock,
  Inbox,
  Send,
  Trash2,
  Undo2,
  XCircle,
} from "lucide-react";

import type { AuditEntityType, ReviewActionType } from "@/lib/api/audit";
import { useAuditTimeline } from "@/lib/queries/audit";

interface Props {
  entityType: AuditEntityType;
  id: string | undefined;
}

const ACTION_META: Record<
  ReviewActionType,
  { label: string; tone: string; Icon: typeof Send }
> = {
  SUBMIT:    { label: "送審",   tone: "text-blue-600 bg-blue-50",    Icon: Send },
  APPROVE:   { label: "核可",   tone: "text-emerald-600 bg-emerald-50", Icon: CheckCircle2 },
  REJECT:    { label: "退回",   tone: "text-amber-700 bg-amber-50",  Icon: XCircle },
  PUBLISH:   { label: "發布",   tone: "text-emerald-700 bg-emerald-100", Icon: Inbox },
  ARCHIVE:   { label: "封存",   tone: "text-rose-700 bg-rose-50",    Icon: Trash2 },
  UNARCHIVE: { label: "取消封存", tone: "text-slate-700 bg-slate-100", Icon: Undo2 },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("zh-Hant", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditTimeline({ entityType, id }: Props) {
  const { data, isPending, isError } = useAuditTimeline(entityType, id);

  return (
    <section className="admin-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">歷程</h2>
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground">載入中…</p>
      )}
      {isError && (
        <p className="text-sm text-destructive">無法載入歷程。</p>
      )}
      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground">尚無紀錄。</p>
      )}

      {data && data.length > 0 && (
        <ol className="relative space-y-4 pl-5">
          <span
            aria-hidden
            className="absolute left-2 top-1 bottom-1 w-px bg-border"
          />
          {data.map((row) => {
            const meta = ACTION_META[row.action];
            const Icon = meta.Icon;
            return (
              <li key={row.id} className="relative">
                <span className="absolute -left-3 top-1 flex size-5 items-center justify-center rounded-full bg-background ring-2 ring-border">
                  <Icon className="size-3 text-muted-foreground" />
                </span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${meta.tone}`}
                  >
                    {meta.label}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {row.performedByName ?? `#${row.performedBy}`}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(row.performedAt)}
                  </span>
                </div>
                {row.comment && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {row.comment}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
