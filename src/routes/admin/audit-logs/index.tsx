import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAdminAPI";

export const Route = createFileRoute("/admin/audit-logs/")({
  component: AuditLogsPage,
});

const RESOURCES = ["client", "creator", "creator_application", "creator_tier", "project", "membership", "payment", "booking", "cms", "user", "admin"];
const ACTIONS = [
  "CREATE", "UPDATE", "DELETE", "SUSPEND", "ACTIVATE", "VERIFY", "REJECT", "APPROVE",
  "EXPORT", "LOGIN", "LOGOUT", "SETTINGS_CHANGE", "BULK_OPERATION", "REQUEST_CHANGES",
  "TIER_CHANGE", "PRICING_APPROVE", "PRICING_REJECT", "VIEW",
];

function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");

  const { data, loading, error, refetch } = useAuditLogs({
    page,
    limit: 20,
    ...(resource ? { resource } : {}),
    ...(action ? { action } : {}),
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Immutable history of sensitive admin actions</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <select
          value={resource}
          onChange={(e) => {
            setResource(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-card border border-border rounded-lg text-sm"
        >
          <option value="">All Resources</option>
          {RESOURCES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-card border border-border rounded-lg text-sm"
        >
          <option value="">All Actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {data && (
        <>
          <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Admin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Resource</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.length > 0 ? (
                  logs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">{log.userEmail}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{log.action}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {log.resource}
                        {log.resourceId ? ` #${String(log.resourceId).slice(-6)}` : ""}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={log.status === "success" ? "text-green-500" : "text-red-500"}>{log.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages && pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {logs.length} of {pagination.total} entries
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-background disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-background disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
