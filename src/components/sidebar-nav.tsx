"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  ArrowLeftRight,
  Briefcase,
  HelpCircle,
  Inbox,
  Newspaper,
  ShieldAlert,
  ShieldBan,
  ScrollText,
  ShieldCheck,
  UserCog,
  Headset,
  Bell,
  Smartphone,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import type { AdminRole } from "@/lib/admin-session";
import type { Dict } from "@/lib/i18n";
import { useDict } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: AdminRole[];
  children?: NavItem[];
}

const OPS_ROLES: AdminRole[] = ["super_admin", "admin", "viewer"];
const OPS_AND_SUPPORT_ROLES: AdminRole[] = [
  "super_admin",
  "admin",
  "viewer",
  "support",
];
const STAFF_ROLES: AdminRole[] = ["super_admin", "hr"];
const CAREERS_ROLES: AdminRole[] = ["super_admin", "admin", "viewer", "hr"];
const CONTENT_ROLES: AdminRole[] = [
  "super_admin",
  "admin",
  "viewer",
  "social_media",
];
const FAQ_ROLES: AdminRole[] = [
  "super_admin",
  "admin",
  "viewer",
  "support",
];

function buildNavItems(dict: Dict): NavItem[] {
  return [
    { href: "/", label: dict.nav.overview, icon: LayoutDashboard, roles: OPS_ROLES },
    {
      href: "/users",
      label: dict.nav.users,
      icon: Users,
      roles: OPS_AND_SUPPORT_ROLES,
      children: [
        {
          href: "/users",
          label: dict.nav.all,
          icon: Users,
          roles: OPS_AND_SUPPORT_ROLES,
        },
        {
          href: "/users/activity",
          label: dict.nav.activity,
          icon: Activity,
          roles: OPS_AND_SUPPORT_ROLES,
        },
        {
          href: "/restrictions",
          label: dict.nav.restrictions,
          icon: ShieldBan,
          roles: OPS_ROLES,
        },
      ],
    },
    {
      href: "/transactions",
      label: dict.nav.transactions,
      icon: ArrowLeftRight,
      roles: OPS_ROLES,
    },
    {
      href: "/support",
      label: dict.nav.support,
      icon: Headset,
      roles: OPS_AND_SUPPORT_ROLES,
    },
    {
      href: "/notifications",
      label: dict.nav.notifications,
      icon: Bell,
      roles: OPS_ROLES,
    },
    {
      href: "/careers",
      label: dict.nav.careers,
      icon: Briefcase,
      roles: CAREERS_ROLES,
      children: [
        {
          href: "/careers",
          label: dict.nav.jobOpenings,
          icon: Briefcase,
          roles: CAREERS_ROLES,
        },
        {
          href: "/careers/applications",
          label: dict.nav.applications,
          icon: Inbox,
          roles: CAREERS_ROLES,
        },
      ],
    },
    {
      href: "/articles",
      label: dict.nav.articles,
      icon: Newspaper,
      roles: CONTENT_ROLES,
    },
    {
      href: "/faq",
      label: dict.nav.faq,
      icon: HelpCircle,
      roles: FAQ_ROLES,
    },
    {
      href: "/app-config",
      label: dict.nav.appConfig,
      icon: Smartphone,
      roles: ["super_admin"],
    },
    {
      href: "/aml-flags",
      label: dict.nav.amlFlags,
      icon: ShieldAlert,
      roles: OPS_ROLES,
    },
    {
      href: "/audit-logs",
      label: dict.nav.auditLogs,
      icon: ScrollText,
      roles: OPS_ROLES,
    },
    {
      href: "/admins",
      label: dict.nav.admins,
      icon: UserCog,
      roles: STAFF_ROLES,
      children: [
        {
          href: "/admins",
          label: dict.nav.all,
          icon: UserCog,
          roles: STAFF_ROLES,
        },
        {
          href: "/admin-logs",
          label: dict.nav.adminLogs,
          icon: ShieldCheck,
          roles: STAFF_ROLES,
        },
      ],
    },
  ];
}

function matchesPath(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  collapsed = false,
  role,
}: {
  collapsed?: boolean;
  role: AdminRole;
}) {
  const pathname = usePathname();
  const dict = useDict();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    {},
  );

  const navItems = buildNavItems(dict)
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter(
        (child) => !child.roles || child.roles.includes(role),
      ),
    }));

  const allItems = navItems.flatMap((item) =>
    item.children ? item.children : [item],
  );
  const activeHref = allItems.reduce((best, item) => {
    if (!matchesPath(item.href, pathname)) {
      return best;
    }
    return item.href.length > best.length ? item.href : best;
  }, "");

  function toggleSection(href: string, isOpen: boolean) {
    setOpenSections((prev) => ({ ...prev, [href]: !isOpen }));
  }

  function renderFlatLink(item: NavItem) {
    const isActive = item.href === activeHref;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <item.icon className="size-4 shrink-0" />
        {collapsed ? null : <span className="truncate">{item.label}</span>}
      </Link>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-0.5 p-2">
      {navItems.map((item) => {
        const children = item.children ?? [];
        if (collapsed || children.length === 0) {
          return (
            <Fragment key={item.href}>
              {collapsed && children.length > 0
                ? children.map((child) => renderFlatLink(child))
                : renderFlatLink(item)}
            </Fragment>
          );
        }
        const hasActiveChild = children.some(
          (child) => child.href === activeHref,
        );
        const isOpen = openSections[item.href] ?? hasActiveChild;
        return (
          <Fragment key={item.href}>
            <button
              type="button"
              onClick={() => toggleSection(item.href, isOpen)}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                hasActiveChild && !isOpen
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left">
                {item.label}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform duration-200",
                  !isOpen && "-rotate-90",
                )}
              />
            </button>
            {isOpen ? (
              <div className="my-0.5 ml-5 flex flex-col gap-0.5 border-l border-border pl-2">
                {children.map((child) => {
                  const isActive = child.href === activeHref;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <span className="block truncate">{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
