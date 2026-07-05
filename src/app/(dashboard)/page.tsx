import Link from "next/link";
import { Users, ArrowLeftRight, ShieldAlert, ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  {
    href: "/users",
    label: "Users",
    description: "Search accounts, review KYC tier, activate or deactivate.",
    icon: Users,
  },
  {
    href: "/transactions",
    label: "Transactions",
    description: "Monitor transfers and reverse completed ones if needed.",
    icon: ArrowLeftRight,
  },
  {
    href: "/aml-flags",
    label: "AML Flags",
    description: "Review flagged activity and mark it resolved or dismissed.",
    icon: ShieldAlert,
  },
  {
    href: "/audit-logs",
    label: "Audit Logs",
    description: "Full trail of account and admin actions.",
    icon: ScrollText,
  },
];

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Pick a section to get started.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <section.icon className="mb-2 size-5 text-primary" />
                <CardTitle>{section.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {section.description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
