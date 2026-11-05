"use client";

import { verifyMfaAction } from "@/actions/auth";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { AuthCard } from "@/components/auth-card";
import { Label } from "@/components/ui/label";
import { OtpCodeInput } from "@/components/otp-code-input";
import { useOtpCodeForm } from "@/components/use-otp-code-form";
import { SubmitButton } from "@/components/submit-button";
import { FormError } from "@/components/form-error";

export default function VerifyMfaPage() {
  const { action, code, setCode, error, formRef, hasError, isPending } =
    useOtpCodeForm(verifyMfaAction);
  const dict = useDict();

  return (
    <AuthCard
      title={dict.auth.verifyTitle}
      description={dict.auth.verifyDescription}
    >
      <form ref={formRef} action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">{dict.auth.verificationCode}</Label>
          <OtpCodeInput
            name="code"
            label={dict.auth.verificationCode}
            value={code}
            onChange={setCode}
            autoFocus
            disabled={isPending}
            hasError={hasError}
          />
        </div>
        <FormError
          message={error ? describeApiError(dict, error) : undefined}
        />
        <SubmitButton pendingText={dict.auth.verifying}>
          {dict.auth.verify}
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
