"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { IconInput } from "@/components/icon-input";
import { PasswordInput } from "@/components/password-input";
import { FormError } from "@/components/form-error";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export default function LoginPage() {
  const [state, action] = useActionState(loginAction, {});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthCard
      title="Sign in"
      description="Enter your admin credentials to continue"
    >
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <IconInput
            icon={Mail}
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <FormError message={state.error} />
        <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
