"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Bell, LogOut } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { logout } from "@/lib/auth/api";
import { useAuthStore } from "@/lib/auth/store";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const mutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      clear();
      toast.success("已登出");
      router.replace("/login");
    },
    onError: () => {
      // Even if server logout fails, clear local state
      clear();
      router.replace("/login");
    },
  });

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        aria-label="通知"
        className="relative size-[38px] rounded-[10px] bg-muted border border-input flex items-center justify-center text-secondary-foreground hover:bg-accent transition-colors"
      >
        <Bell className="size-[18px]" />
        <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive border-2 border-white" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="size-[38px] rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white text-[15px] font-bold flex items-center justify-center">
            {initials(user.name)}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
              <span className="text-[10px] text-muted-foreground mt-1">{user.role}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <LogOut className="mr-2 size-4" />
            登出
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
