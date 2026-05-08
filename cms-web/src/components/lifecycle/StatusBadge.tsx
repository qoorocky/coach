import { cn } from "@/lib/utils";
import type { ContentStatus } from "@/lib/domain/types";

const STYLE: Record<ContentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  IN_REVIEW: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-rose-100 text-rose-800",
};

const LABEL: Record<ContentStatus, string> = {
  DRAFT: "草稿",
  IN_REVIEW: "審核中",
  PUBLISHED: "已發布",
  ARCHIVED: "已封存",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap",
        STYLE[status],
      )}
    >
      {LABEL[status]}
    </span>
  );
}
