export function resolveDateRange(searchParams: {
  period?: string;
  from?: string;
  to?: string;
}) {
  if (searchParams.from || searchParams.to) {
    return {
      period: "custom",
      dateFrom: searchParams.from
        ? new Date(searchParams.from).toISOString()
        : undefined,
      dateTo: searchParams.to
        ? new Date(`${searchParams.to}T23:59:59.999Z`).toISOString()
        : undefined,
    };
  }
  const period = searchParams.period ?? "30d";
  if (period === "all") {
    return { period, dateFrom: undefined, dateTo: undefined };
  }
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const dateFrom = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString();
  return { period, dateFrom, dateTo: undefined };
}
