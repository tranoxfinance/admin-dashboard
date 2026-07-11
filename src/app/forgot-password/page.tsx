"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import { forgotPasswordAction } from "@/actions/auth";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { AuthCard } from "@/components/auth-card";
import { IconInput } from "@/components/icon-input";
import { FormError } from "@/components/form-error";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(forgotPasswordAction, {});
  const dict = useDict();

  if (state.success) {
    return (
      <AuthCard title={dict.auth.checkEmailTitle}>
        <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/50 px-4 py-6 text-center">
          <CheckCircle2 className="size-8 text-green" />
          <p className="text-sm text-muted-foreground">
            {dict.auth.checkEmailBody}
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            {dict.auth.backToSignIn}
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={dict.auth.forgotTitle}
      description={dict.auth.forgotDescription}
    >
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{dict.auth.email}</Label>
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
        <FormError
          message={state.error ? describeApiError(dict, state.error) : undefined}
        />
        <SubmitButton pendingText={dict.auth.sending}>
          {dict.auth.sendResetLink}
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          {dict.auth.backToSignIn}
        </Link>
      </p>
    </AuthCard>
  );
}
