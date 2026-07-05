export interface AdminUserRow {
  id: string;
  phone: string;
  email: string | null;
  country: string;
  kycTier: number;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  recipientId: string;
  sendAmount: string;
  sendCurrency: string;
  receiveAmount: string;
  receiveCurrency: string;
  status: "pending" | "processing" | "completed" | "failed" | "reversed";
  failureReason: string | null;
  initiatedAt: string;
  completedAt: string | null;
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
