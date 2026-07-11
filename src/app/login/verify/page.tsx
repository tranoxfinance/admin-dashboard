"use client";

import { useActionState, useRef, useState } from "react";
import { verifyMfaAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormError } from "@/components/form-error";

export default function VerifyMfaPage() {
  const [state, action, isPending] = useActionState(verifyMfaAction, {});
  const [code, setCode] = useState("");
  const [lastError, setLastError] = useState(state.error);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  if (state.error !== lastError) {
    setLastError(state.error);
    if (state.error) {
      setCode("");
    }
  }

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.replace(/\D/g, "").slice(0, 6);
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
      title="Enter your code"
      description="Open your authenticator app and enter the 6-digit code"
    >
      <form ref={formRef} action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            autoFocus
            required
            value={code}
            onChange={handleCodeChange}
            className="text-center text-lg tracking-[0.5em]"
          />
        </div>
        <FormError message={state.error} />
        <SubmitButton pendingText="Verifying…">Verify</SubmitButton>
      </form>
    </AuthCard>
  );
}
