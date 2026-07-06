"use client";

import { Suspense, useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { PasswordInput } from "@/components/password-input";
import { FormError } from "@/components/form-error";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, action] = useActionState(resetPasswordAction, {});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchError, setMatchError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (password !== confirmPassword) {
      event.preventDefault();
      setMatchError("Passwords do not match.");
      return;
    }
    setMatchError(undefined);
  }

  if (state.success) {
    return (
      <AuthCard title="Password updated">
        <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/50 px-4 py-6 text-center">
          <CheckCircle2 className="size-8 text-green" />
          <p className="text-sm text-muted-foreground">
            Your password has been reset. You can now sign in with your new
            password.
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  if (!token) {
    return (
      <AuthCard title="Reset link invalid">
        <FormError message="This reset link is missing its token. Request a new one." />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Request a new link
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a new password for your admin account"
    >
      <form action={action} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={12}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            At least 12 characters, with upper, lower, digit, and symbol.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <FormError message={matchError ?? state.error} />
        <SubmitButton pendingText="Updating…">Update password</SubmitButton>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
