"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useDict } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export function CopySecret({ secret }: { secret: string }) {
  const [copied, setCopied] = useState(false);
  const dict = useDict();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success(dict.auth.secretCopied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(dict.auth.secretCopyFailed);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-xs text-muted-foreground transition-colors",
        "hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      <span className="break-all">{secret}</span>
      {copied ? (
        <Check className="size-3.5 shrink-0 text-green-500" />
      ) : (
        <Copy className="size-3.5 shrink-0" />
      )}
    </button>
  );
}
