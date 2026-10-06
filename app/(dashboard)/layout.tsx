import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/server/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { IdleWatcher } from "@/components/auth/IdleWatcher";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar admin={admin} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] px-6 py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
      <IdleWatcher idleMinutes={60} warnAtMinutes={55} />
    </div>
  );
}