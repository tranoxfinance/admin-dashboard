import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  Banknote,
  PiggyBank,
  Wallet as WalletIcon,
} from "lucide-react";
import { adminApi, AdminApiError } from "@/lib/admin-api";
import { getSession } from "@/lib/admin-session";
import { formatDate, formatVolumeSummary } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";
import type { Dict } from "@/lib/i18n";
import type {
  ActivityItem,
  AuditLog,
  KycDocumentRow,
  Paginated,
  RiskLevel,
  UserProfile,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InsightCard } from "@/components/insight-card";
import { StatCard } from "@/components/overview/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogsTable } from "../../audit-logs/audit-logs-table";
import { UserNotifyDialog } from "../user-notify-dialog";
import { UserRestrictDialog } from "../user-restrict-dialog";
import { UserStatusToggle } from "../user-status-toggle";
import { UserKycPanel } from "./user-kyc-panel";
import { UserTransactionsPanel } from "./user-transactions-panel";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dict = await getDict();
  const session = await getSession();
  if (session?.role === "hr" || session?.role === "social_media") {
    redirect("/");
  }
  const canManage =
    session?.role === "super_admin" || session?.role === "admin";
  const canViewFinancials = session?.role !== "support";

  let profile: UserProfile;
  try {
    profile = await adminApi<UserProfile>(`/admin/users/${id}`);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const [kycDocuments, activity, auditLogs] = await Promise.all([
    adminApi<KycDocumentRow[]>(`/admin/kyc/users/${id}`),
    canViewFinancials
      ? adminApi<Paginated<ActivityItem>>(
          `/admin/transactions?page=1&limit=50&userId=${id}`,
        )
      : Promise.resolve(null),
    canViewFinancials
      ? adminApi<Paginated<AuditLog>>(
          `/admin/audit-logs?page=1&limit=20&userId=${id}`,
        )
      : Promise.resolve(null),
  ]);

  const t = dict.userProfile;
  const name =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.phone;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground"
            nativeButton={false}
            render={<Link href="/users" />}
          >
            <ArrowLeft className="size-3.5" />
            {t.back}
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-semibold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              {profile.phone}
              {profile.email ? ` · ${profile.email}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {profile.restrictionLevel === "suspended" ? (
              <Badge variant="destructive">{dict.users.statusSuspended}</Badge>
            ) : profile.restrictionLevel === "restricted" ? (
              <Badge className="bg-amber-500 text-white">
                {dict.users.statusRestricted}
              </Badge>
            ) : profile.isLocked ? (
              <Badge variant="destructive">{dict.users.statusLocked}</Badge>
            ) : profile.isActive ? (
              <Badge className="bg-green text-white">
                {dict.users.statusActive}
              </Badge>
            ) : profile.closedAt ? (
              <Badge variant="outline">{dict.users.statusClosed}</Badge>
            ) : (
              <Badge variant="outline">{dict.users.statusInactive}</Badge>
            )}
            <Badge variant="outline">
              {dict.users.kycLabels[profile.kycTier] ?? profile.kycTier}
            </Badge>
            <Badge variant="outline">
              {t.fieldRiskLevel}: {riskLabel(dict, profile.riskLevel)}
            </Badge>
          </div>
        </div>
        {canManage ? (
          <div className="flex items-center gap-2">
            <UserNotifyDialog userId={profile.id} />
            {profile.restrictionLevel === null ? (
              <UserRestrictDialog userId={profile.id} />
            ) : null}
            <UserStatusToggle userId={profile.id} isActive={profile.isActive} />
          </div>
        ) : null}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t.tabOverview}</TabsTrigger>
          {canViewFinancials ? (
            <TabsTrigger value="transactions">{t.tabTransactions}</TabsTrigger>
          ) : null}
          <TabsTrigger value="kyc">{t.tabKyc}</TabsTrigger>
          {canViewFinancials ? (
            <TabsTrigger value="activity">{t.tabActivity}</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={PiggyBank}
              label={t.statDeposited}
              value={formatVolumeSummary(
                profile.totals.deposits,
                dict.common.noVolumeShort,
              )}
              secondary={t.depositsCount(
                profile.totals.deposits.reduce((sum, d) => sum + d.count, 0),
              )}
              color="#95c015"
            />
            <StatCard
              icon={Banknote}
              label={t.statWithdrawn}
              value={formatVolumeSummary(
                profile.totals.withdrawals,
                dict.common.noVolumeShort,
              )}
              secondary={t.withdrawalsCount(
                profile.totals.withdrawals.reduce((sum, w) => sum + w.count, 0),
              )}
              color="#e9a028"
            />
            <StatCard
              icon={ArrowLeftRight}
              label={t.statTransferred}
              value={formatVolumeSummary(
                profile.totals.transfersSent,
                dict.common.noVolumeShort,
              )}
              secondary={t.transfersCount(
                profile.totals.transfersSent.reduce((sum, x) => sum + x.count, 0),
              )}
              color="#0d8fd2"
            />
            <StatCard
              icon={WalletIcon}
              label={t.statBalance}
              value={formatVolumeSummary(
                profile.wallets.map((w) => ({
                  currency: w.currency,
                  volume: w.balance,
                })),
                dict.common.noVolumeShort,
              )}
              secondary={
                profile.wallets.some((w) => Number(w.lockedBalance) > 0)
                  ? t.lockedFunds(
                      formatVolumeSummary(
                        profile.wallets
                          .filter((w) => Number(w.lockedBalance) > 0)
                          .map((w) => ({
                            currency: w.currency,
                            volume: w.lockedBalance,
                          })),
                      ),
                    )
                  : undefined
              }
              color="#00407a"
            />
          </div>

          <InsightCard title={t.detailsTitle}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={t.fieldFullName} value={name} />
              <Field label={t.fieldPhone} value={profile.phone} />
              <Field label={t.fieldEmail} value={profile.email ?? "—"} />
              <Field
                label={t.fieldCountry}
                value={dict.markets[profile.country] ?? profile.country}
              />
              <Field
                label={t.fieldGender}
                value={
                  profile.gender === "male"
                    ? dict.users.genderMale
                    : profile.gender === "female"
                      ? dict.users.genderFemale
                      : "—"
                }
              />
              <Field
                label={t.fieldDob}
                value={
                  profile.dateOfBirth
                    ? formatDate(profile.dateOfBirth, dict.common.dateLocale)
                    : "—"
                }
              />
              <Field
                label={t.fieldJoined}
                value={formatDate(profile.createdAt, dict.common.dateLocale)}
              />
              <Field
                label={t.fieldRiskScore}
                value={String(profile.riskScore)}
              />
              <Field
                label={t.fieldRestriction}
                value={
                  profile.restrictionLevel === "suspended"
                    ? dict.users.statusSuspended
                    : profile.restrictionLevel === "restricted"
                      ? dict.users.statusRestricted
                      : t.none
                }
              />
              {profile.closedAt ? (
                <Field
                  label={t.fieldClosedAt}
                  value={formatDate(profile.closedAt, dict.common.dateLocale)}
                />
              ) : null}
              {profile.retentionPurgeAt ? (
                <Field
                  label={t.fieldRetainedUntil}
                  value={formatDate(
                    profile.retentionPurgeAt,
                    dict.common.dateLocale,
                  )}
                />
              ) : null}
            </div>
          </InsightCard>
        </TabsContent>

        {canViewFinancials ? (
          <TabsContent value="transactions">
            <UserTransactionsPanel
              userId={profile.id}
              canManage={canManage}
              initialData={activity?.items ?? []}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="kyc">
          <UserKycPanel canManage={canManage} initialDocuments={kycDocuments} />
        </TabsContent>

        {canViewFinancials ? (
          <TabsContent value="activity">
            <AuditLogsTable data={auditLogs?.items ?? []} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}

function riskLabel(dict: Dict, level: RiskLevel): string {
  if (level === "high") return dict.transactions.riskHigh;
  if (level === "medium") return dict.transactions.riskMedium;
  return dict.transactions.riskLow;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
