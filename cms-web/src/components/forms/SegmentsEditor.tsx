"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SegmentDialog } from "./SegmentDialog";
import {
  useAddSegment,
  useDeleteSegment,
  useReorderSegments,
  useUpdateSegment,
} from "@/lib/queries/workouts";
import { useExercises } from "@/lib/queries/exercises";
import type { ExerciseDraft, WorkoutSegment } from "@/lib/domain/types";

interface Props {
  workoutId: string;
  segments: WorkoutSegment[];
  disabled?: boolean;
}

export function SegmentsEditor({ workoutId, segments, disabled }: Props) {
  const exercisesQuery = useExercises({ status: "PUBLISHED", page: 0, size: 200 });
  const exercises = exercisesQuery.data?.content ?? [];
  const exerciseById = new Map(exercises.map((ex) => [ex.id, ex]));

  const add = useAddSegment(workoutId);
  const update = useUpdateSegment(workoutId);
  const del = useDeleteSegment(workoutId);
  const reorder = useReorderSegments(workoutId);

  const [order, setOrder] = useState<WorkoutSegment[]>(segments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkoutSegment | null>(null);

  useEffect(() => {
    setOrder(segments);
  }, [segments]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((s) => s.segmentId === active.id);
    const newIndex = order.findIndex((s) => s.segmentId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    reorder.mutate(
      next.map((s) => s.segmentId),
      {
        onError: (err) => {
          toast.error((err as Error).message);
          setOrder(segments);
        },
      },
    );
  }

  const isMutating =
    add.isPending || update.isPending || del.isPending || reorder.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Segments ({order.length})</h2>
        <Button
          size="sm"
          disabled={disabled || exercises.length === 0}
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          新增 segment
        </Button>
      </div>

      {exercises.length === 0 && !exercisesQuery.isPending && (
        <p className="text-sm text-muted-foreground">
          尚無已發布的動作。請先建立並核准動作後再新增 segment。
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={order.map((s) => s.segmentId)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {order.map((s, i) => (
              <SortableSegmentRow
                key={s.segmentId}
                index={i}
                segment={s}
                exercise={exerciseById.get(s.exerciseId)}
                disabled={disabled || isMutating}
                onEdit={() => {
                  setEditing(s);
                  setDialogOpen(true);
                }}
                onDelete={() => {
                  if (!confirm("確定刪除此 segment？")) return;
                  del.mutate(s.segmentId, {
                    onSuccess: () => toast.success("已刪除"),
                    onError: (err) => toast.error((err as Error).message),
                  });
                }}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {order.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
          尚無 segment，請新增。
        </p>
      )}

      <SegmentDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        initial={editing ?? undefined}
        exercises={exercises}
        pending={add.isPending || update.isPending}
        onConfirm={(req) => {
          if (editing) {
            update.mutate(
              { segmentId: editing.segmentId, req },
              {
                onSuccess: () => {
                  toast.success("已更新");
                  setDialogOpen(false);
                  setEditing(null);
                },
                onError: (err) => toast.error((err as Error).message),
              },
            );
          } else {
            add.mutate(req, {
              onSuccess: () => {
                toast.success("已新增");
                setDialogOpen(false);
              },
              onError: (err) => toast.error((err as Error).message),
            });
          }
        }}
      />
    </div>
  );
}

interface RowProps {
  index: number;
  segment: WorkoutSegment;
  exercise?: ExerciseDraft;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableSegmentRow({
  index,
  segment,
  exercise,
  disabled,
  onEdit,
  onDelete,
}: RowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: segment.segmentId });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : undefined,
      }}
      className="flex items-center gap-2 rounded-md border bg-card p-2"
    >
      <button
        type="button"
        className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
        disabled={disabled}
        {...attributes}
        {...listeners}
        aria-label="拖拉以重新排序"
      >
        <GripVertical className="size-4" />
      </button>

      <span className="text-xs text-muted-foreground w-6 text-center">{index + 1}</span>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {exercise?.nameZh ?? "(已刪除或未發布動作)"}
        </p>
        <p className="text-xs text-muted-foreground">
          {segment.durationSec}s × {segment.rounds} 回 · 休息 {segment.restAfterSec}s
        </p>
      </div>

      <Button size="icon-sm" variant="ghost" onClick={onEdit} disabled={disabled}>
        <Pencil className="size-3.5" />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onDelete}
        disabled={disabled}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </li>
  );
}
