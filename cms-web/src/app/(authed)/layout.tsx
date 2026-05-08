"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/Sidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { Skeleton } from "@/components/ui/skeleton";

import { ApiError } from "@/lib/api/client";
import { me } from "@/lib/auth/api";
import { useAuthStore } from "@/lib/auth/store";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useAuthStore((s) => s.setUser);
  const cachedUser = useAuthStore((s) => s.user);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => me(),
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  useEffect(() => {
    if (!query.isError) return;
    const status = (query.error as ApiError | undefined)?.status;
    if (status === 401 || status === 403) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [query.isError, query.error, router, pathname]);

  // Until /me resolves, show a skeleton (avoids flashing protected content)
  if (query.isPending && !cachedUser) {
    return (
      <div className="flex h-screen">
        <div className="w-56 border-r p-4 space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full mt-4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-6 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return null; // useEffect above is redirecting
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[60px] bg-white border-b border-border flex items-center justify-end px-7 gap-3 sticky top-0 z-10">
          <UserMenu />
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
