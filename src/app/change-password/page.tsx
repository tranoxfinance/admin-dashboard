"use client";

import { useActionState, useState } from "react";
import { changeTempPasswordAction } from "@/actions/auth";
import { describeApiError } from "@/lib/i18n";
import { PASSWORD_PATTERN } from "@/lib/validation";
import { useDict } from "@/components/i18n-provider";
import { AuthCard } from "@/components/auth-card";
import { PasswordInput } from "@/components/password-input";
import { FormError } from "@/components/form-error";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export default function ChangePasswordPage() {
  const [state, action] = useActionState(changeTempPasswordAction, {});
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const dict = useDict();
  const t = dict.auth;
  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <AuthCard
      title={t.changePasswordTitle}
      description={t.changePasswordDescription}
    >
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t.newPassword}</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            autoFocus
            required
            minLength={12}
            maxLength={72}
            pattern={PASSWORD_PATTERN}
            title={t.passwordRules}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t.passwordRules}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-password">{t.confirmNewPassword}</Label>
          <PasswordInput
            id="confirm-password"
            name="confirm"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={72}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </div>
        <FormError
          message={
            mismatch
              ? t.passwordsDoNotMatch
              : state.error
                ? describeApiError(dict, state.error)
                : undefined
          }
        />
        <SubmitButton
          pendingText={t.changingPassword}
          disabled={mismatch || password.length < 12}
        >
          {t.changePassword}
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
