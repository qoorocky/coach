"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MusicForm } from "@/components/forms/MusicForm";
import { BackLink } from "@/components/nav/BackLink";
import { Skeleton } from "@/components/ui/skeleton";
import { useMusic, useUpdateMusic } from "@/lib/queries/music";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditMusicPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isPending, error } = useMusic(id);
  const update = useUpdateMusic(id);

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-3">
        <BackLink href="/music" />
        <h1 className="text-xl font-semibold">找不到音樂</h1>
        <p className="text-sm text-muted-foreground">
          {error ? (error as Error).message : "資料不存在"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackLink href="/music" />
      <div>
        <h1 className="text-2xl font-semibold">編輯音樂</h1>
        <p className="text-sm text-muted-foreground">{data.name}</p>
      </div>
      <MusicForm
        initial={data}
        submitLabel="儲存變更"
        pending={update.isPending}
        onCancel={() => router.push("/music")}
        onSubmit={(req) =>
          update.mutate(req, {
            onSuccess: () => {
              toast.success("已更新");
              router.push("/music");
            },
            onError: (e) => toast.error((e as Error).message),
          })
        }
      />
    </div>
  );
}
