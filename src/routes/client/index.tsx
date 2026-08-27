import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useClientDashboard } from "@/hooks/useClientAPI";
import { useNotifications } from "@/hooks/useCreatorAPI";

export const Route = createFileRoute("/client/")({
  head: () => ({
    meta: [{ title: "Dashboard - Client" }],
  }),
  component: ClientDashboard,
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

function ClientDashboard() {
  const { data, loading, error, lastUpdated, refetch } = useClientDashboard();
  const { data: notifications } = useNotifications(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const stats = data?.stats;
  const recentProjects = Array.isArray(data?.recentProjects) ? data.recentProjects : [];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.firstName || "there"}</h1>
          <p className="text-muted-foreground mt-1">
            {lastUpdated
              ? `Manage your projects, discover talent and stay connected with CC. Last updated: ${lastUpdated.toLocaleTimeString()}`
              : "Manage your projects, discover talent and stay connected with CC."}
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
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard label="Active Projects" value={stats?.activeProjects ?? 0} />
            <KPICard label="Completed Projects" value={stats?.completedProjects ?? 0} />
            <KPICard label="Saved Creators" value={stats?.savedCreators ?? 0} />
            <KPICard
              label="Membership"
              value={stats?.membershipStatus === "premium" ? "Premium" : "Free"}
            />
          </div>

          {/* Current Work + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Current Work</h2>
                <Link to="/client/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((p: any) => (
                    <Link
                      key={p._id}
                      to="/client/projects/$id"
                      params={{ id: p._id }}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.displayCode || p.projectCode} · {p.creatorId?.companyName || "Awaiting creator match"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${PROJECT_STATUS_COLORS[p.status] || ""}`}>
                        {p.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">No active projects</p>
                  <Link
                    to="/client/projects"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    Start a project
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Recent Activity</h2>
                <Link to="/client/notifications" className="text-sm text-primary hover:underline flex items-center gap-1">
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

          {/* Creator Discovery teaser */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Discover Creators</h2>
              <Link to="/client/marketplace" className="text-sm text-primary hover:underline flex items-center gap-1">
                Browse all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Browse CC's vetted, verified creator network — request one through CC to start a project.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
