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

export type SupportConversationStatus =
  | "bot"
  | "pending_agent"
  | "active"
  | "resolved"
  | "closed";

export type SupportConversationKind = "chat" | "ticket";

export type SupportTicketCategory =
  | "transfer"
  | "topup"
  | "withdrawal"
  | "kyc"
  | "account"
  | "other";

export interface SupportConversationUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
}

export interface SupportConversationRow {
  id: string;
  status: SupportConversationStatus;
  kind: SupportConversationKind;
  subject: string | null;
  category: SupportTicketCategory | null;
  reference: string | null;
  assignedAdminId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  user: SupportConversationUser | null;
}

export type SupportMessageSenderType = "user" | "bot" | "agent";

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderType: SupportMessageSenderType;
  senderAdminId: string | null;
  body: string;
  createdAt: string;
}

export interface SupportConversationDetail {
  conversation: {
    id: string;
    status: SupportConversationStatus;
    kind: SupportConversationKind;
    subject: string | null;
    category: SupportTicketCategory | null;
    reference: string | null;
    assignedAdminId: string | null;
    lastMessageAt: string | null;
    createdAt: string;
  };
  user:
    | (SupportConversationUser & { email: string | null })
    | null;
  messages: SupportMessage[];
}
