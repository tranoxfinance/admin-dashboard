"use client";

import { useState, useTransition } from "react";
import { UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { createAdminAction } from "@/actions/admin";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import type { AdminAccountRow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_VALUES: AdminAccountRow["role"][] = [
  "viewer",
  "admin",
  "super_admin",
];

export function CreateAdminDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminAccountRow["role"]>("viewer");
  const [isPending, startTransition] = useTransition();
  const dict = useDict();
  const t = dict.admins.dialog;

  function handleCreate() {
    startTransition(async () => {
      const result = await createAdminAction({
        email: email.trim(),
        password,
        role,
      });
      if (result.ok) {
        toast.success(t.createdToast);
        setOpen(false);
        setEmail("");
        setPassword("");
        setRole("viewer");
      } else {
        toast.error(describeApiError(dict, result.error));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <UserRoundPlus className="size-3.5" />
        {dict.admins.createAdmin}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-admin-email">{t.email}</Label>
            <Input
              id="new-admin-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-admin-password">{t.password}</Label>
            <PasswordInput
              id="new-admin-password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t.passwordHint}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t.role}</Label>
            <Select
              value={role}
              onValueChange={(value) => {
                if (value) setRole(value as AdminAccountRow["role"]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {dict.admins.roles[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {dict.admins.roleHints[role]}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {dict.common.cancel}
          </Button>
          <Button
            disabled={isPending || !email.trim() || password.length < 12}
            onClick={handleCreate}
          >
            {isPending ? t.creating : t.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
