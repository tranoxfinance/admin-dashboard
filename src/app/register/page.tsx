"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export default function RegisterPage() {
  const [state, action] = useActionState(registerAction, {});

  return (
    <AuthCard
      title="Create admin account"
      description="Requires the one-time bootstrap key from the server operator"
    >
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
          />
          <p className="text-xs text-muted-foreground">
            At least 12 characters, with upper, lower, digit, and symbol.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bootstrapKey">Bootstrap key</Label>
          <Input id="bootstrapKey" name="bootstrapKey" type="password" required />
        </div>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        <SubmitButton pendingText="Creating account…">
          Create account
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
