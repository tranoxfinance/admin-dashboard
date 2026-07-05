import { redirect } from "next/navigation";
import Image from "next/image";
import { adminApiPublic } from "@/lib/admin-api";
import { getShortLivedCookie, ENROLLMENT_COOKIE } from "@/lib/admin-session";
import { AuthCard } from "@/components/auth-card";
import { Separator } from "@/components/ui/separator";
import { EnrollForm } from "./enroll-form";

interface TotpSetupResponse {
  secret: string;
  qrCodeDataUrl: string;
  otpauthUrl: string;
}

export default async function SetupPage() {
  const enrollmentToken = await getShortLivedCookie(ENROLLMENT_COOKIE);
  if (!enrollmentToken) {
    redirect("/login");
  }

  let setup: TotpSetupResponse;
  try {
    setup = await adminApiPublic<TotpSetupResponse>("/admin/auth/totp/setup", {
      method: "POST",
      headers: { Authorization: `Bearer ${enrollmentToken}` },
    });
  } catch {
    redirect("/login");
  }

  return (
    <AuthCard
      title="Set up two-factor authentication"
      description="Scan this QR code with Google Authenticator, Authy, or another TOTP app"
    >
      <div className="flex flex-col items-center gap-3">
        <Image
          src={setup.qrCodeDataUrl}
          alt="Scan with your authenticator app"
          width={200}
          height={200}
          className="rounded-lg ring-1 ring-foreground/10"
          unoptimized
        />
        <p className="break-all text-center font-mono text-xs text-muted-foreground">
          {setup.secret}
        </p>
      </div>
      <Separator className="my-4" />
      <EnrollForm />
    </AuthCard>
  );
}
