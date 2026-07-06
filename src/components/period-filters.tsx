"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "All time", value: "all" },
];

export function PeriodFilters({ period }: { period: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  function applyPreset(value: string) {
    setFrom("");
    setTo("");
    router.push(`${pathname}?period=${value}`);
  }

  function applyCustomRange() {
    const params = new URLSearchParams();
    if (from) {
      params.set("from", from);
    }
    if (to) {
      params.set("to", to);
    }
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => applyPreset(preset.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              period === preset.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 border-l pl-3">
        <Input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="h-8 w-[9.5rem]"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="h-8 w-[9.5rem]"
        />
        <Button size="sm" onClick={applyCustomRange}>
          Apply
        </Button>
      </div>
    </div>
  );
}
