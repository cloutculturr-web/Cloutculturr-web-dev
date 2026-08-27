import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useCreatorDashboard, useCreatorProjects, useNotifications } from "@/hooks/useCreatorAPI";

export const Route = createFileRoute("/creator/")({
  head: () => ({
    meta: [{ title: "Dashboard - Creator" }],
  }),
  component: CreatorDashboard,
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function KPICard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function StatusBadge({ label, value, tone }: { label: string; value: string; tone: "green" | "yellow" | "red" | "blue" | "gray" }) {
  const toneClasses: Record<string, string> = {
    green: "bg-green-500/20 text-green-500",
    yellow: "bg-yellow-500/20 text-yellow-500",
    red: "bg-red-500/20 text-red-500",
    blue: "bg-blue-500/20 text-blue-500",
    gray: "bg-muted text-muted-foreground",
  };
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <span className={`inline-flex w-fit px-3 py-1 rounded-full text-sm font-medium ${toneClasses[tone]}`}>{value}</span>
    </div>
  );
}

const PROJECT_STATUS_COLORS: Record<string, string> = {
  enquiry: "bg-gray-500/20 text-gray-500",
  requirements: "bg-blue-500/20 text-blue-500",
  review: "bg-yellow-500/20 text-yellow-500",
  quoted: "bg-purple-500/20 text-purple-500",
  approved: "bg-cyan-500/20 text-cyan-500",
  active: "bg-green-500/20 text-green-500",
  completed: "bg-emerald-500/20 text-emerald-500",
  archived: "bg-slate-500/20 text-slate-500",
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function CreatorDashboard() {
  const { data, loading, error, lastUpdated, refetch } = useCreatorDashboard();
  const { data: activeProjectsData } = useCreatorProjects("active");
  const { data: notifications } = useNotifications(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const profile = data?.profile;
  const stats = data?.stats;
  const activeProjects = Array.isArray(activeProjectsData) ? activeProjectsData : [];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.firstName || "Creator"}</h1>
          <p className="text-muted-foreground mt-1">
            {lastUpdated ? `Here's what's happening with your CC work. Last updated: ${lastUpdated.toLocaleTimeString()}` : "Here's what's happening with your CC work."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-50 border border-border"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-500">Unable to load dashboard data</p>
            <p className="text-sm text-red-500/80 mt-1">{error}</p>
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/30">
            Retry
          </button>
        </div>
      )}

      {loading && !data && !error && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      )}

      {data && (
        <>
          {/* Creator Status */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-wrap gap-8">
              <StatusBadge label="Tier" value={profile?.tierId?.name || "Not assigned"} tone={profile?.tierId ? "blue" : "gray"} />
              <StatusBadge
                label="CC Status"
                value={profile?.verification?.status === "verified" ? "Verified" : profile?.verification?.status === "rejected" ? "Rejected" : "Pending Verification"}
                tone={profile?.verification?.status === "verified" ? "green" : profile?.verification?.status === "rejected" ? "red" : "yellow"}
              />
              <StatusBadge
                label="Availability"
                value={(profile?.availability || "available").replace(/^\w/, (c: string) => c.toUpperCase())}
                tone={profile?.availability === "available" ? "green" : profile?.availability === "busy" ? "yellow" : "red"}
              />
              <div className="flex flex-col gap-1.5 min-w-[160px]">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Profile Completion</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${stats?.profileCompletion || 0}%` }} />
                  </div>
                  <span className="text-sm font-medium">{stats?.profileCompletion || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard label="Active Projects" value={stats?.activeProjects ?? 0} />
            <KPICard label="Completed Projects" value={stats?.completedProjects ?? 0} />
            <KPICard label="Pending Payout" value={formatCurrency(stats?.pendingPayout)} />
          </div>

          {/* Current Work + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Current Work</h2>
                <Link to="/creator/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {activeProjects.length > 0 ? (
                <div className="space-y-3">
                  {activeProjects.slice(0, 5).map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.projectCode} · {p.clientId?.companyName || "Client"}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${PROJECT_STATUS_COLORS[p.status] || ""}`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active projects yet.</p>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Recent Activity</h2>
                <Link to="/creator/notifications" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((n: any) => (
                    <div key={n._id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
