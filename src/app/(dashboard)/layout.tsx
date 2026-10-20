import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin-session";
import { AlertsBell } from "@/components/alerts-bell";
import { LogoutButton } from "@/components/logout-button";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const role = session.role ?? "admin";

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar email={session.email} role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-sidebar px-4 md:hidden">
          <Image src="/tranox-logo.svg" alt="Tranox" width={96} height={24} className="h-6 w-auto" />
          <div className="flex items-center gap-1">
            {role !== "hr" && role !== "social_media" ? (
              <AlertsBell align="end" />
            ) : null}
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
