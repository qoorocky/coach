"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (comment: string) => void;
  pending?: boolean;
}

export function RejectDialog({ open, onOpenChange, onConfirm, pending }: Props) {
  const [comment, setComment] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setComment("");
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>退回</DialogTitle>
          <DialogDescription>退回原因會送回給編輯者，必填。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="reject-comment">原因</Label>
          <Textarea
            id="reject-comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="例如：請補上正確的影片連結與描述。"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            disabled={!comment.trim() || pending}
            onClick={() => onConfirm(comment.trim())}
          >
            {pending ? "送出中..." : "確認退回"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
