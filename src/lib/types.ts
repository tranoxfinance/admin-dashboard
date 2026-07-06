export interface AdminUserRow {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  email: string | null;
  country: string;
  kycTier: number;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
}

export type ActivityType = "transfer" | "topup" | "withdrawal";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  amount: string;
  currency: string;
  secondaryAmount?: string;
  secondaryCurrency?: string;
  status: string;
  initiatedAt: string;
  completedAt: string | null;
}

export interface ActivityDailyPoint {
  date: string;
  transfers: number;
  topups: number;
  withdrawals: number;
}

export interface ActivityStatusCount {
  status: string;
  count: number;
}

export interface ActivityCurrencyTotal {
  currency: string;
  volume: string;
  count: number;
}

export interface ActivityStats {
  daily: ActivityDailyPoint[];
  byType: {
    type: ActivityType;
    statuses: ActivityStatusCount[];
  }[];
  totals: {
    transfers: ActivityCurrencyTotal[];
    topups: ActivityCurrencyTotal[];
    withdrawals: ActivityCurrencyTotal[];
  };
}

export interface UserGrowthPoint {
  date: string;
  count: number;
}

export interface KycTierCount {
  tier: number;
  count: number;
}

export interface CountryCount {
  country: string;
  count: number;
}

export interface RevenueDailyPoint {
  date: string;
  currency: string;
  volume: string;
}

export interface OverviewStats {
  totalUsers: number;
  newUsers: number;
  userGrowthDaily: UserGrowthPoint[];
  kycDistribution: KycTierCount[];
  countryDistribution: CountryCount[];
  transactionsByCountry: CountryCount[];
  transactionCount: number;
  activityDaily: UserGrowthPoint[];
  volumeTotals: {
    transfers: ActivityCurrencyTotal[];
    topups: ActivityCurrencyTotal[];
    withdrawals: ActivityCurrencyTotal[];
    combined: ActivityCurrencyTotal[];
  };
  volumeDaily: RevenueDailyPoint[];
  revenue: {
    totals: ActivityCurrencyTotal[];
    daily: RevenueDailyPoint[];
  };
  openAmlFlags: number;
  previousPeriod: { newUsers: number; transactionCount: number } | null;
}

export interface AmlFlag {
  id: string;
  userId: string;
  transactionId: string | null;
  reason: string;
  status: "open" | "reviewed" | "dismissed";
  createdAt: string;
  reviewedAt: string | null;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
}
