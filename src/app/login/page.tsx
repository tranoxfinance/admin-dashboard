"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export default function LoginPage() {
  const [state, action] = useActionState(loginAction, {});

  return (
    <AuthCard
      title="Tranox Admin"
      description="Sign in with your admin credentials"
    >
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        No admin account yet?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register with bootstrap key
        </Link>
      </p>
    </AuthCard>
  );
}
