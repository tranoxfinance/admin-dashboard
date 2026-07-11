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
