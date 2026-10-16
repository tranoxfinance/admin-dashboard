export function formatCurrency(amount: string, currency: string): string {
  const value = Number(amount);
  if (currency === "XOF") {
    return `CFA ${new Intl.NumberFormat("fr-CI", {
      maximumFractionDigits: 0,
    }).format(value)}`;
  }
  return `₦${new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

export function formatDate(value: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatVolumeSummary(
  totals: { currency: string; volume: string }[],
  emptyText = "No volume",
): string {
  if (!totals.length) {
    return emptyText;
  }
  return totals
    .map((entry) => formatCurrency(entry.volume, entry.currency))
    .join(" · ");
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/SamsungBrowser\//, "Samsung Internet"],
  [/Chrome\//, "Chrome"],
  [/Firefox\//, "Firefox"],
  [/Safari\//, "Safari"],
  [/okhttp|Dart\//, "App"],
];

const SYSTEMS: [RegExp, string][] = [
  [/Android/, "Android"],
  [/iPhone|iPad|iOS/, "iOS"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Linux/, "Linux"],
];

export function summarizeUserAgent(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  if (!browser && !system) return userAgent.slice(0, 40);
  return [browser, system].filter(Boolean).join(" · ");
}
