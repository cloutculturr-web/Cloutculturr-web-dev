import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useCreatorProjects } from "@/hooks/useCreatorAPI";

export const Route = createFileRoute("/creator/projects/")({
  component: CreatorProjects,
});

const PROJECT_STATUSES = ["enquiry", "requirements", "review", "quoted", "approved", "active", "completed", "archived"];

const STATUS_COLORS: Record<string, string> = {
  enquiry: "bg-gray-500/20 text-gray-500",
  requirements: "bg-blue-500/20 text-blue-500",
  review: "bg-yellow-500/20 text-yellow-500",
  quoted: "bg-purple-500/20 text-purple-500",
  approved: "bg-cyan-500/20 text-cyan-500",
  active: "bg-green-500/20 text-green-500",
  completed: "bg-emerald-500/20 text-emerald-500",
  archived: "bg-slate-500/20 text-slate-500",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function CreatorProjects() {
  const [status, setStatus] = useState("");
  const { data, loading, error, refetch } = useCreatorProjects(status || undefined);
  const projects = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">Everything CC has assigned to you</p>
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-50 border border-border"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Unable to load projects</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
          <button onClick={() => refetch()} className="ml-auto px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg text-sm hover:bg-red-500/30">
            Retry
          </button>
        </div>
      )}

      {data && (
        <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Project</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Budget</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Progress</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.length > 0 ? (
                projects.map((p: any) => (
                  <tr key={p._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.projectCode}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{p.clientId?.companyName || "—"}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatCurrency(p.budget)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ""}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-background rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${p.execution?.progress || 0}%` }} />
                        </div>
                        <span className="text-xs">{p.execution?.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-muted-foreground">{p.payment?.status || "pending"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No projects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
