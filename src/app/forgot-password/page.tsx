"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import { forgotPasswordAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { IconInput } from "@/components/icon-input";
import { FormError } from "@/components/form-error";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(forgotPasswordAction, {});

  if (state.success) {
    return (
      <AuthCard title="Check your email">
        <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/50 px-4 py-6 text-center">
          <CheckCircle2 className="size-8 text-green" />
          <p className="text-sm text-muted-foreground">
            If an admin account exists for that email, we&apos;ve sent a link
            to reset the password. It expires in 30 minutes.
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

  return (
    <AuthCard
      title="Forgot password"
      description="Enter your admin email and we'll send you a reset link"
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
          />
        </div>
        <FormError message={state.error} />
        <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
