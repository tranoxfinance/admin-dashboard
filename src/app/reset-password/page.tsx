"use client";

import { Suspense, useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/actions/auth";
import { describeApiError } from "@/lib/i18n";
import { PASSWORD_PATTERN } from "@/lib/validation";
import { useDict } from "@/components/i18n-provider";
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
  const dict = useDict();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (password !== confirmPassword) {
      event.preventDefault();
      setMatchError(dict.auth.passwordsDoNotMatch);
      return;
    }
    setMatchError(undefined);
  }

  if (state.success) {
    return (
      <AuthCard title={dict.auth.passwordUpdatedTitle}>
        <div className="flex flex-col items-center gap-3 rounded-lg bg-muted/50 px-4 py-6 text-center">
          <CheckCircle2 className="size-8 text-green" />
          <p className="text-sm text-muted-foreground">
            {dict.auth.passwordUpdatedBody}
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

  if (!token) {
    return (
      <AuthCard title={dict.auth.resetInvalidTitle}>
        <FormError message={dict.auth.resetInvalidBody} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-primary hover:underline">
            {dict.auth.requestNewLink}
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={dict.auth.resetTitle}
      description={dict.auth.resetDescription}
    >
      <form action={action} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{dict.auth.newPassword}</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={72}
            pattern={PASSWORD_PATTERN}
            title={dict.auth.passwordRules}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {dict.auth.passwordRules}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">
            {dict.auth.confirmNewPassword}
          </Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <FormError
          message={
            matchError ??
            (state.error ? describeApiError(dict, state.error) : undefined)
          }
        />
        <SubmitButton pendingText={dict.auth.updating}>
          {dict.auth.updatePassword}
        </SubmitButton>
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
