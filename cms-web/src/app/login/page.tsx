"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ApiError } from "@/lib/api/client";
import { login, me } from "@/lib/auth/api";
import { useAuthStore } from "@/lib/auth/store";

const schema = z.object({
  email: z.string().email("請輸入有效 email"),
  password: z.string().min(1, "請輸入密碼"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const next = params.get("next") || "/";

  // If somebody hits /login while session is still alive, bounce them
  useEffect(() => {
    if (user) {
      router.replace(next);
      return;
    }
    me()
      .then((u) => {
        setUser(u);
        router.replace(next);
      })
      .catch(() => {
        // not logged in; stay on this page
      });
  }, [user, setUser, router, next]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@coach.local", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => login(values),
    onSuccess: (u) => {
      setUser(u);
      toast.success(`歡迎回來，${u.name}`);
      router.replace(next);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiError && err.status === 401
          ? "Email 或密碼錯誤"
          : err instanceof Error
            ? err.message
            : "登入失敗";
      toast.error(msg);
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Coach CMS</CardTitle>
          <CardDescription>內容後台 — 請以 CMS 帳號登入</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            noValidate
          >
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={mutation.isPending}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={mutation.isPending}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "登入中..." : "登入"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
