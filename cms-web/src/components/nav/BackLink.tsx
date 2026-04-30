"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  href: string;
  label?: string;
}

export function BackLink({ href, label = "回列表" }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  );
}
