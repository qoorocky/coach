"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MusicForm } from "@/components/forms/MusicForm";
import { BackLink } from "@/components/nav/BackLink";
import { useCreateMusic } from "@/lib/queries/music";

export default function NewMusicPage() {
  const router = useRouter();
  const create = useCreateMusic();

  return (
    <div className="space-y-4">
      <BackLink href="/music" />
      <div>
        <h1 className="text-2xl font-semibold">新增音樂</h1>
        <p className="text-sm text-muted-foreground">先上傳音樂檔，再填名稱與授權。</p>
      </div>
      <MusicForm
        submitLabel="建立"
        pending={create.isPending}
        onCancel={() => router.push("/music")}
        onSubmit={(req) =>
          create.mutate(req, {
            onSuccess: () => {
              toast.success("已新增音樂");
              router.push("/music");
            },
            onError: (e) => toast.error((e as Error).message),
          })
        }
      />
    </div>
  );
}
