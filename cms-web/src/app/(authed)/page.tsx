"use client";

import { useAuthStore } from "@/lib/auth/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">儀表板</h1>
        <p className="text-sm text-muted-foreground">內部 CMS — Phase 1 M2</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>已登入</CardTitle>
          <CardDescription>目前 session 狀態</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">姓名</span>
            <span>{user?.name ?? "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email ?? "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">角色</span>
            <Badge variant="secondary">{user?.role ?? "-"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
