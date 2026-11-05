"use client";

import { useActionState, useEffect, useRef, useState } from "react";

const OTP_CODE_LENGTH = 6;

export function useOtpCodeForm(
  formAction: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>,
) {
  const [state, action, isPending] = useActionState(formAction, {});
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

  useEffect(() => {
    if (code.length < OTP_CODE_LENGTH) {
      submittedRef.current = false;
      return;
    }
    if (!isPending && !submittedRef.current) {
      submittedRef.current = true;
      formRef.current?.requestSubmit();
    }
  }, [code, isPending]);

  return {
    action,
    code,
    setCode,
    error: state.error,
    formRef,
    hasError: Boolean(state.error) && code === "",
    isPending,
  };
}
