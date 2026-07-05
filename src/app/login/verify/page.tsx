"use client";

import { useActionState } from "react";
import { verifyMfaAction } from "@/actions/auth";
import { AuthCard } from "@/components/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export default function VerifyMfaPage() {
  const [state, action] = useActionState(verifyMfaAction, {});

  return (
    <AuthCard
      title="Enter your code"
      description="Open your authenticator app and enter the 6-digit code"
    >
      <form action={action} className="flex flex-col gap-4">
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
            className="text-center text-lg tracking-[0.5em]"
          />
        </div>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        <SubmitButton pendingText="Verifying…">Verify</SubmitButton>
      </form>
    </AuthCard>
  );
}
