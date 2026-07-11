"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDict } from "@/components/i18n-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PeriodSelect({
  paramName,
  value,
}: {
  paramName: string;
  value: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dict = useDict();

  const options = [
    { label: dict.periods.last7, value: "7d" },
    { label: dict.periods.last30, value: "30d" },
    { label: dict.periods.last90, value: "90d" },
    { label: dict.periods.allTime, value: "all" },
  ];

  function handleChange(next: string | null) {
    if (!next) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="h-7 gap-1 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
