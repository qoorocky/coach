"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { CmsUser, Role } from "@/lib/api/users";
import {
  useCreateUser,
  useSetUserPassword,
  useUpdateUser,
  useUsers,
} from "@/lib/queries/users";
import { useAuthStore } from "@/lib/auth/store";

const ROLE_LABEL: Record<Role, string> = {
  EDITOR: "Editor",
  REVIEWER: "Reviewer",
  ADMIN: "Admin",
};

const ROLE_TONE: Record<Role, string> = {
  EDITOR: "bg-slate-100 text-slate-700",
  REVIEWER: "bg-blue-100 text-blue-800",
  ADMIN: "bg-amber-100 text-amber-800",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-Hant", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UsersPage() {
  const me = useAuthStore((s) => s.user);
  const { data, isPending, isError } = useUsers();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<CmsUser | null>(null);
  const [passwordFor, setPasswordFor] = useState<CmsUser | null>(null);

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">
            帳號管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理 CMS 內部使用者帳號、角色與密碼。
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>＋ 新增帳號</Button>
      </div>

      <section className="admin-card overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted text-[12px] font-semibold text-muted-foreground">
              <th className="text-left px-5 py-3">姓名 / Email</th>
              <th className="text-left px-5 py-3">角色</th>
              <th className="text-left px-5 py-3">狀態</th>
              <th className="text-left px-5 py-3">最後登入</th>
              <th className="text-right px-5 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {isPending && (
              <tr>
                <td colSpan={5} className="px-5 py-6">
                  <Skeleton className="h-6 w-full" />
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-destructive">
                  載入失敗。
                </td>
              </tr>
            )}
            {data?.map((u) => {
              const isMe = me?.userId === u.id;
              return (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-5 py-3">
                    <p className="font-semibold">
                      {u.name}
                      {isMe && (
                        <span className="ml-2 text-[10px] text-primary font-medium">
                          （你）
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${ROLE_TONE[u.role]}`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                        u.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {u.active ? "啟用" : "停用"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">
                    {formatDateTime(u.lastLoginAt)}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(u)}
                    >
                      編輯
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPasswordFor(u)}
                    >
                      改密碼
                    </Button>
                  </td>
                </tr>
              );
            })}
            {data && data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  尚無帳號。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditUserDialog
          key={editing.id}
          user={editing}
          isSelf={me?.userId === editing.id}
          onClose={() => setEditing(null)}
        />
      )}
      {passwordFor && (
        <PasswordDialog
          key={`pw-${passwordFor.id}`}
          user={passwordFor}
          onClose={() => setPasswordFor(null)}
        />
      )}
    </div>
  );
}

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: Role;
  onChange: (v: Role) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Role)}
      disabled={disabled}
      className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
    >
      <option value="EDITOR">Editor</option>
      <option value="REVIEWER">Reviewer</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("EDITOR");
  const [password, setPassword] = useState("");
  const create = useCreateUser();

  function reset() {
    setEmail("");
    setName("");
    setRole("EDITOR");
    setPassword("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增帳號</DialogTitle>
          <DialogDescription>建立 Editor / Reviewer / Admin 帳號。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor@coach.local"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-name">姓名</Label>
            <Input
              id="new-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="王小明"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>角色</Label>
            <RoleSelect value={role} onChange={setRole} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-password">初始密碼</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 字元"
              autoComplete="new-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={create.isPending}
          >
            取消
          </Button>
          <Button
            disabled={
              create.isPending ||
              !email.trim() ||
              !name.trim() ||
              password.length < 8
            }
            onClick={() =>
              create.mutate(
                {
                  email: email.trim(),
                  name: name.trim(),
                  role,
                  password,
                },
                {
                  onSuccess: () => {
                    toast.success("帳號已建立");
                    reset();
                    onOpenChange(false);
                  },
                  onError: (err: Error) =>
                    toast.error(`建立失敗：${err.message}`),
                },
              )
            }
          >
            {create.isPending ? "建立中…" : "建立"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  isSelf,
  onClose,
}: {
  user: CmsUser;
  isSelf: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<Role>(user.role);
  const [active, setActive] = useState(user.active);
  const update = useUpdateUser(user.id);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編輯帳號</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="edit-name">姓名</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>角色</Label>
            <RoleSelect value={role} onChange={setRole} disabled={isSelf} />
            {isSelf && (
              <p className="text-[11px] text-muted-foreground">
                為避免鎖死帳號，不能修改自己的角色或狀態。
              </p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              disabled={isSelf}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4 accent-primary"
            />
            啟用此帳號
          </label>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={update.isPending}
          >
            取消
          </Button>
          <Button
            disabled={update.isPending || !name.trim()}
            onClick={() =>
              update.mutate(
                { name: name.trim(), role, active },
                {
                  onSuccess: () => {
                    toast.success("帳號已更新");
                    onClose();
                  },
                  onError: (err: Error) =>
                    toast.error(`更新失敗：${err.message}`),
                },
              )
            }
          >
            {update.isPending ? "更新中…" : "更新"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PasswordDialog({
  user,
  onClose,
}: {
  user: CmsUser;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const setPasswordMutation = useSetUserPassword(user.id);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重設密碼</DialogTitle>
          <DialogDescription>
            為 {user.name}（{user.email}）設定新密碼。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="reset-pw">新密碼</Label>
          <Input
            id="reset-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 8 字元"
            autoComplete="new-password"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={setPasswordMutation.isPending}
          >
            取消
          </Button>
          <Button
            disabled={setPasswordMutation.isPending || password.length < 8}
            onClick={() =>
              setPasswordMutation.mutate(password, {
                onSuccess: () => {
                  toast.success("密碼已更新");
                  onClose();
                },
                onError: (err: Error) =>
                  toast.error(`更新失敗：${err.message}`),
              })
            }
          >
            {setPasswordMutation.isPending ? "更新中…" : "更新密碼"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
