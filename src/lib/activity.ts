import { ACTIVITY_CATEGORICAL } from "./chart-colors";
import type { ActionCount } from "./types";

export function humanizeAction(action: string): string {
  return action.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
}

const CATEGORY_LABELS = [
  "Transfers",
  "Top-ups",
  "Withdrawals",
  "Account & security",
  "KYC & identity",
  "Other",
];

const SECURITY_ACTIONS = new Set([
  "otp_sent",
  "login_success",
  "logout",
  "user_registered",
  "pin_set",
  "pin_failed",
  "account_locked",
  "biometric_token_issued",
  "refresh_token_reuse_detected",
]);

function categoryIndex(action: string): number {
  if (action.startsWith("transfer")) return 0;
  if (action.startsWith("wallet_topup")) return 1;
  if (action.startsWith("withdrawal")) return 2;
  if (
    SECURITY_ACTIONS.has(action) ||
    action.startsWith("transaction_pin") ||
    action.startsWith("transaction_biometric")
  ) {
    return 3;
  }
  if (action.startsWith("kyc") || action.startsWith("email_ver")) return 4;
  return 5;
}

export function buildCategoryBreakdown(breakdown: ActionCount[]) {
  const totals = CATEGORY_LABELS.map(() => 0);
  for (const row of breakdown) {
    totals[categoryIndex(row.action)] += row.count;
  }
  return CATEGORY_LABELS.map((label, index) => ({
    label,
    value: totals[index],
    color: ACTIVITY_CATEGORICAL[index],
  })).filter((segment) => segment.value > 0);
}
