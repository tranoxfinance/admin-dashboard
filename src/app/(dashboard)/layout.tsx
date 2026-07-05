import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  ShieldAlert,
  ScrollText,
} from "lucide-react";
import { getSession } from "@/lib/admin-session";
import { LogoutButton } from "@/components/logout-button";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/aml-flags", label: "AML Flags", icon: ShieldAlert },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r bg-muted/20 md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4 font-heading text-sm font-semibold">
          Tranox Admin
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <p className="truncate px-1 text-xs text-muted-foreground">
            {session.email}
          </p>
          <LogoutButton />
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex h-14 items-center justify-between border-b px-4 md:hidden">
          <span className="font-heading text-sm font-semibold">
            Tranox Admin
          </span>
          <LogoutButton />
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
