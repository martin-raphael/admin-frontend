import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-muted">
      {/* Soft blue gradient backdrop — no icons, just color depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 15% 0%, rgba(37,99,235,0.10) 0%, transparent 60%), radial-gradient(50% 40% at 100% 100%, rgba(5,150,105,0.08) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          {/* Wordmark */}
          <Link href="/" className="mb-10 block text-center">
            <div className="font-display text-[26px] font-bold tracking-tight text-ink-900">
              Furniture enSuite
            </div>
            <div className="mt-2 inline-flex items-center gap-2">
              <span className="h-px w-8 bg-brand-500" />
              <span className="eyebrow">Admin Console</span>
              <span className="h-px w-8 bg-brand-500" />
            </div>
          </Link>

          <div className="card p-8 sm:p-10">{children}</div>

          <p className="mt-8 text-center text-xs text-ink-500">
            © {new Date().getFullYear()} Furniture enSuite · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}