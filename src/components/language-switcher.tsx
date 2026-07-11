"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { setLocaleAction } from "@/actions/locale";
import { useDict, useLocale } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const dict = useDict();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await setLocaleAction(locale === "en" ? "fr" : "en");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      disabled={isPending}
      aria-label={dict.nav.language}
      title={locale === "en" ? "Français" : "English"}
      className="text-muted-foreground"
    >
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
        <Languages className="size-3.5" />
        {locale === "en" ? "FR" : "EN"}
      </span>
    </Button>
  );
}
