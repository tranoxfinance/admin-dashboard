import Image from "next/image";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 flex-col items-start justify-between overflow-hidden bg-gradient-to-br from-brand to-navy p-10 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px]"
        />
        <Image
          src="/tranox-logo.svg"
          alt="Tranox"
          width={112}
          height={28}
          className="relative h-7 w-auto brightness-0 invert"
        />
        <div className="relative max-w-sm">
          <h2 className="font-heading text-3xl font-semibold leading-tight">
            Admin console
          </h2>
          <p className="mt-3 text-sm text-white/80">
            Manage users, monitor transfers, and review compliance flags in
            one place.
          </p>
        </div>
        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Tranox. Internal use only.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          <Image
            src="/tranox-logo.svg"
            alt="Tranox"
            width={112}
            height={28}
            className="mb-8 h-7 w-auto lg:hidden"
          />
          <h1 className="font-heading text-2xl font-semibold">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
