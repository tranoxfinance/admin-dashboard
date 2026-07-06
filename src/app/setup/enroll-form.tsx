"use client";

import { useActionState } from "react";
import { enrollTotpAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormError } from "@/components/form-error";

export function EnrollForm() {
  const [state, action] = useActionState(enrollTotpAction, {});

  return (
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
          required
          className="text-center text-lg tracking-[0.5em]"
        />
      </div>
      <FormError message={state.error} />
      <SubmitButton pendingText="Verifying…">
        Confirm and enable
      </SubmitButton>
    </form>
  );
}
