"use client";

import { useActionState, useRef, useState } from "react";
import { verifyMfaAction } from "@/actions/auth";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { AuthCard } from "@/components/auth-card";
import { Label } from "@/components/ui/label";
import { OtpCodeInput } from "@/components/otp-code-input";
import { SubmitButton } from "@/components/submit-button";
import { FormError } from "@/components/form-error";

export default function VerifyMfaPage() {
  const [state, action, isPending] = useActionState(verifyMfaAction, {});
  const [code, setCode] = useState("");
  const [lastError, setLastError] = useState(state.error);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);
  const dict = useDict();

  if (state.error !== lastError) {
    setLastError(state.error);
    if (state.error) {
      setCode("");
    }
  }

  const handleCodeChange = (next: string) => {
    setCode(next);
    if (next.length < 6) {
      submittedRef.current = false;
      return;
    }
    if (!isPending && !submittedRef.current) {
      submittedRef.current = true;
      formRef.current?.requestSubmit();
    }
  };

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
            value={code}
            onChange={handleCodeChange}
            autoFocus
            disabled={isPending}
          />
        </div>
        <FormError
          message={state.error ? describeApiError(dict, state.error) : undefined}
        />
        <SubmitButton pendingText={dict.auth.verifying}>
          {dict.auth.verify}
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
