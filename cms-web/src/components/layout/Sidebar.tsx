"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  ListChecks,
  Layers,
  Music,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth/store";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
  adminOnly?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    group: "主選單",
    items: [
      { href: "/", label: "儀表板", icon: LayoutDashboard, matchPrefix: undefined },
      { href: "/exercises", label: "動作管理", icon: Dumbbell, matchPrefix: "/exercises" },
      { href: "/workouts", label: "課程管理", icon: Layers, matchPrefix: "/workouts" },
    ],
  },
  {
    group: "內容",
    items: [
      { href: "/music", label: "音樂庫", icon: Music, matchPrefix: "/music" },
      { href: "/review", label: "待審核", icon: ListChecks, matchPrefix: "/review" },
    ],
  },
  {
    group: "管理",
    items: [
      {
        href: "/users",
        label: "帳號管理",
        icon: Users,
        matchPrefix: "/users",
        adminOnly: true,
      },
    ],
  },
];

function LogoMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect width="36" height="36" rx="10" fill="#F97316" />
      <rect x="10" y="9" width="16" height="3.5" rx="1.5" fill="white" />
      <rect x="10" y="9" width="3.5" height="18" rx="1.5" fill="white" />
      <rect x="10" y="16.5" width="12" height="3" rx="1.5" fill="white" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const visibleGroups = NAV
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => !item.adminOnly || role === "ADMIN"),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <aside className="w-[230px] shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-white text-[15px] font-extrabold leading-tight tracking-tight">
              Coach CMS
            </p>
            <p className="text-sidebar-foreground/80 text-[10px] tracking-wider mt-[2px]">
              HIIT Content
            </p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {visibleGroups.map((group) => (
          <div key={group.group} className="mb-5">
            <p className="text-[10px] font-bold text-sidebar-foreground/70 tracking-[0.08em] px-2 mb-1.5">
              {group.group}
            </p>
            {group.items.map(({ href, label, icon: Icon, matchPrefix }) => {
              const active = matchPrefix
                ? pathname.startsWith(matchPrefix)
                : pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] mb-0.5 transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[17px]",
                      active ? "text-primary" : "text-sidebar-foreground",
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
