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
  restrictionLevel: RestrictionLevel | null;
  createdAt: string;
}

export type RestrictionLevel = "restricted" | "suspended";

export type RestrictionReason =
  | "aml_velocity"
  | "fraud_suspicion"
  | "compliance_review"
  | "other";

export type RestrictionStatus = "active" | "lifted";

export type RestrictionAppealStatus = "pending" | "approved" | "rejected";

export interface RestrictionUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
}

export interface AccountRestrictionRow {
  id: string;
  reference: string;
  level: RestrictionLevel;
  reason: RestrictionReason;
  note: string | null;
  source: "manual" | "aml_auto";
  status: RestrictionStatus;
  amlFlagId: string | null;
  liftedAt: string | null;
  createdAt: string;
  user: RestrictionUser | null;
  appeal: { id: string; status: RestrictionAppealStatus } | null;
}

export interface RestrictionAppealRow {
  id: string;
  status: RestrictionAppealStatus;
  statement: string;
  conversationId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  restriction: {
    id: string;
    reference: string;
    level: RestrictionLevel;
    reason: RestrictionReason;
    status: RestrictionStatus;
  } | null;
  user: RestrictionUser | null;
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
  activeUsers: number;
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
  previousPeriod: {
    newUsers: number;
    transactionCount: number;
    activeUsers: number;
  } | null;
}

export interface ActionCount {
  action: string;
  count: number;
}

export interface UserActivityStats {
  activeUsers: number;
  totalUsers: number;
  totalEvents: number;
  actionBreakdown: ActionCount[];
  dailyActiveUsers: UserGrowthPoint[];
  previousPeriod: { activeUsers: number } | null;
}

export interface UserActivityRow {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  email: string | null;
  country: string;
  eventCount: number;
  topAction: string | null;
  lastAction: string | null;
  lastActiveAt: string;
}

export interface AmlFlag {
  id: string;
  userId: string;
  transactionId: string | null;
  reason: string;
  status: "open" | "reviewed" | "dismissed";
  createdAt: string;
  reviewedAt: string | null;
  restriction: {
    id: string;
    level: RestrictionLevel;
    reference: string;
  } | null;
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
