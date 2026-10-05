import { listSessions } from "@/lib/api/sessions.server";
import { RevokeSessionButton } from "./RevokeSessionButton";
import { relativeTime, formatDateTime } from "@/lib/utils";
import { getCurrentAdmin } from "@/server/auth";

export async function SessionsPanel() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  let sessions: Awaited<ReturnType<typeof listSessions>> = [];
  try {
    sessions = await listSessions();
  } catch {
    sessions = [];
  }

  if (sessions.length === 0) {
    return (
      <div className="card p-6">
        <div className="eyebrow mb-2">Sessions</div>
        <h2 className="heading-3 mb-2">No active sessions</h2>
        <p className="muted">
          Active logins across all devices will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-300/40 px-6 py-5">
        <div>
          <div className="eyebrow mb-1">Active sessions</div>
          <h2 className="heading-3">
            {sessions.length} device{sessions.length === 1 ? "" : "s"} signed
            in
          </h2>
        </div>
        <p className="text-xs text-ink-500">Sorted by most recent activity</p>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="w-16">#</th>
              <th>Device</th>
              <th>IP address</th>
              <th>Last active</th>
              <th>Started</th>
              <th className="w-32"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={s.id}>
                <td className="text-[11px] font-semibold tracking-widest text-ink-400">
                  {String(i + 1).padStart(2, "0")}
                </td>

                <td>
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full " +
                        (s.is_current
                          ? "bg-accent-500"
                          : s.device === "Mobile"
                            ? "bg-brand-500"
                            : s.device === "Tablet"
                              ? "bg-brand-400"
                              : "bg-ink-400")
                      }
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink-900">
                          {s.browser} on {s.os}
                        </span>
                        {s.is_current && (
                          <span className="badge-green !text-[10px]">
                            This device
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-ink-500">
                        {s.device}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="font-mono text-xs text-ink-600">
                  {s.ip_address}
                </td>

                <td>
                  <div className="text-sm text-ink-700">
                    {relativeTime(s.last_activity_at)}
                  </div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-400">
                    {formatDateTime(s.last_activity_at)}
                  </div>
                </td>

                <td>
                  <div className="text-sm text-ink-700">
                    {relativeTime(s.created_at)}
                  </div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-400">
                    {formatDateTime(s.created_at)}
                  </div>
                </td>

                <td className="text-right">
                  {s.is_current ? (
                    <span className="text-xs text-ink-400">
                      Current session
                    </span>
                  ) : (
                    <RevokeSessionButton sessionId={s.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}