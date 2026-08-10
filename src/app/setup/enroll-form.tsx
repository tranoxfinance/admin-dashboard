"use client";

import { useActionState, useState } from "react";
import { enrollTotpAction } from "@/actions/auth";
import { describeApiError } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { Label } from "@/components/ui/label";
import { OtpCodeInput } from "@/components/otp-code-input";
import { SubmitButton } from "@/components/submit-button";
import { FormError } from "@/components/form-error";

export function EnrollForm() {
  const [state, action] = useActionState(enrollTotpAction, {});
  const [code, setCode] = useState("");
  const dict = useDict();

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">{dict.auth.verificationCode}</Label>
        <OtpCodeInput name="code" value={code} onChange={setCode} autoFocus />
      </div>
      <FormError
        message={state.error ? describeApiError(dict, state.error) : undefined}
      />
      <SubmitButton pendingText={dict.auth.verifying}>
        {dict.auth.confirmEnable}
      </SubmitButton>
    </form>
  );
}
