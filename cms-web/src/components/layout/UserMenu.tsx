"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-md px-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{user.name}</span>
        <Badge variant="secondary" className="text-[10px]">
          {user.role}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
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
  );
}
