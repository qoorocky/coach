import { Badge } from "@/components/ui/badge";
import type { ContentStatus } from "@/lib/domain/types";

const TONE: Record<ContentStatus, "secondary" | "default" | "outline" | "destructive"> = {
  DRAFT: "outline",
  IN_REVIEW: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "destructive",
};

const LABEL: Record<ContentStatus, string> = {
  DRAFT: "草稿",
  IN_REVIEW: "審核中",
  PUBLISHED: "已發布",
  ARCHIVED: "已封存",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <Badge variant={TONE[status]}>{LABEL[status]}</Badge>;
}
