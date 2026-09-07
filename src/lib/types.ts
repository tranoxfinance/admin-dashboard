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
  gender: "male" | "female" | null;
  dateOfBirth: string | null;
  createdAt: string;
  closedAt: string | null;
  retentionPurgeAt: string | null;
}

export interface UserWalletBalance {
  currency: string;
  balance: string;
  lockedBalance: string;
}

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  email: string | null;
  country: string;
  gender: "male" | "female" | null;
  dateOfBirth: string | null;
  kycTier: number;
  isActive: boolean;
  isLocked: boolean;
  restrictionLevel: RestrictionLevel | null;
  riskScore: number;
  riskLevel: RiskLevel;
  customDailyLimits: { NGN?: string; XOF?: string } | null;
  createdAt: string;
  closedAt: string | null;
  retentionPurgeAt: string | null;
  wallets: UserWalletBalance[];
  totals: {
    deposits: ActivityCurrencyTotal[];
    withdrawals: ActivityCurrencyTotal[];
    transfersSent: ActivityCurrencyTotal[];
  };
}

export type KycDocumentStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "declined"
  | "expired";

export interface KycDocumentRow {
  id: string;
  type: string | null;
  purpose: string;
  status: KycDocumentStatus;
  diditRef: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export type AppPlatform = "ios" | "android";

export interface AppConfigRow {
  platform: AppPlatform;
  minimumVersion: string;
  latestVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  updateMessage: string | null;
  updatedAt: string;
}

export type ServiceName = "transfers" | "topups" | "withdrawals" | "kyc";
export type ServiceStatusLevel = "operational" | "degraded" | "down";

export interface ServiceStatusRow {
  service: ServiceName;
  status: ServiceStatusLevel;
  message: string | null;
  updatedAt: string;
}

export type AdminNotificationChannel = "email" | "push" | "inbox";

export interface AdminNotificationRow {
  id: string;
  adminId: string;
  targetType: "user" | "broadcast";
  targetUserId: string | null;
  title: string;
  body: string;
  channels: AdminNotificationChannel[];
  recipientCount: number;
  status: "queued" | "sent" | "failed";
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

export type RiskLevel = "low" | "medium" | "high";

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
  riskScore?: number | null;
  riskLevel?: RiskLevel | null;
  heldReason?: string | null;
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

export interface AdminAccountRow {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "support" | "hr" | "social_media" | "viewer";
  isActive: boolean;
  totpEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminLogRow {
  id: string;
  adminId: string | null;
  adminEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export type JobStatus = "draft" | "open" | "closed";

export type JobEmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship";

export interface JobOpeningRow {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: JobEmploymentType;
  status: JobStatus;
  description: string;
  requirements: string;
  applicationCount: number;
  publishedAt: string | null;
  closesAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = "submitted" | "interview" | "rejected" | "hired";

export interface JobApplicationRow {
  id: string;
  jobId: string;
  jobTitle: string;
  reference: string;
  fullName: string;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  coverLetter: string | null;
  cvFilename: string;
  cvUrl?: string | null;
  status: ApplicationStatus;
  interviewAt: string | null;
  decisionNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export type ArticleStatus = "draft" | "published" | "archived";

export type ArticleCategory = "news" | "press" | "product" | "community";

export interface ArticleMediaItem {
  id: string;
  mediaType: "image" | "video";
  url: string;
}

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  category: ArticleCategory;
  status: ArticleStatus;
  coverImageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  media: ArticleMediaItem[];
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
