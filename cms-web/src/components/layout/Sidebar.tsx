"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, ListChecks, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "儀表板", icon: LayoutDashboard, matchPrefix: undefined },
  { href: "/exercises", label: "動作管理", icon: Dumbbell, matchPrefix: "/exercises" },
  { href: "/workouts", label: "課程管理", icon: Layers, matchPrefix: "/workouts" },
  { href: "/review", label: "待審核", icon: ListChecks, matchPrefix: "/review" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5 border-b">
        <div className="text-lg font-semibold">Coach CMS</div>
        <div className="text-xs text-muted-foreground">HIIT Content</div>
      </div>
      <nav className="grid gap-0.5 p-2">
        {NAV.map(({ href, label, icon: Icon, matchPrefix }) => {
          const active = matchPrefix
            ? pathname.startsWith(matchPrefix)
            : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
