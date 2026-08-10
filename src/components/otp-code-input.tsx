"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export function OtpCodeInput({
  name,
  length = 6,
  value,
  onChange,
  autoFocus,
  disabled,
}: {
  name: string;
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(index: number, digit: string) {
    const next = value.split("");
    while (next.length < length) {
      next.push("");
    }
    next[index] = digit;
    onChange(next.join("").slice(0, length));
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 0) {
      setDigit(index, "");
      return;
    }
    if (digits.length > 1) {
      const next = value.split("");
      while (next.length < length) {
        next.push("");
      }
      for (let i = 0; i < digits.length && index + i < length; i++) {
        next[index + i] = digits[i];
      }
      onChange(next.join("").slice(0, length));
      const lastFilled = Math.min(index + digits.length, length - 1);
      inputRefs.current[lastFilled]?.focus();
      return;
    }
    setDigit(index, digits);
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigit(index - 1, "");
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) {
      return;
    }
    event.preventDefault();
    handleChange(index, pasted);
  }

  return (
    <div className="grid w-full grid-cols-6 gap-2">
      <input type="hidden" name={name} value={value} />
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          className={cn(
            "h-12 w-full rounded-lg border border-input bg-transparent text-center text-lg font-semibold outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
            "dark:bg-input/30 dark:disabled:bg-input/80",
          )}
        />
      ))}
    </div>
  );
}
