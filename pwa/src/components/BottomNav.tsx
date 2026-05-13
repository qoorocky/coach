"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, History, Settings } from "lucide-react";

// Bottom nav from design/Fitness App.html Screen() (line ~393).
// We keep four real destinations rather than the design's five demo tabs.
const NAV = [
  { href: "/", label: "首頁", Icon: Home, match: (p: string) => p === "/" },
  {
    href: "/workouts",
    label: "課程",
    Icon: Dumbbell,
    match: (p: string) => p.startsWith("/workouts"),
  },
  {
    href: "/history",
    label: "紀錄",
    Icon: History,
    match: (p: string) => p.startsWith("/history"),
  },
  {
    href: "/settings",
    label: "設定",
    Icon: Settings,
    match: (p: string) => p.startsWith("/settings"),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="主要導覽"
      className="fixed inset-x-0 bottom-0 z-30 h-[72px] border-t border-border bg-nav/95 backdrop-blur-md flex items-center justify-around px-1"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV.map(({ href, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center gap-1 px-3 py-1.5"
          >
            <Icon
              className="size-[22px]"
              strokeWidth={active ? 2 : 1.8}
              color={active ? "var(--primary)" : "var(--dim)"}
            />
            <span
              className="text-[10px] tracking-wider"
              style={{
                color: active ? "var(--primary)" : "var(--dim)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {label}
            </span>
            {active && (
              <span className="size-[3px] rounded-full bg-primary -mt-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
