import type { RestrictionReason } from "@/lib/types";

export const RESTRICTION_REASON_LABELS: Record<RestrictionReason, string> = {
  aml_velocity: "AML velocity",
  fraud_suspicion: "Fraud suspicion",
  compliance_review: "Compliance review",
  other: "Other",
};
