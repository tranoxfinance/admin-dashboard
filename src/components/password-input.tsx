"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, Lock, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({
  icon: Icon = Lock,
  className,
  ...props
}: ComponentProps<typeof Input> & { icon?: LucideIcon }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-9 pl-9", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {visible ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  );
}
