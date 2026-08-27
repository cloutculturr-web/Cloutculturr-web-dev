import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Users,
  UserCheck,
  Briefcase,
  ClipboardList,
  Layers,
  ScrollText,
  CheckCircle2,
  XCircle,
  DollarSign,
  LogIn,
  LogOut as LogOutIcon,
  FileEdit,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboard } from "@/hooks/useAdminAPI";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard - Admin" },
      { name: "description", content: "Platform overview and KPIs" },
    ],
  }),
  component: AdminDashboard,
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
}

function KPICard({ label, value, change }: KPICardProps) {
  const trend = (change ?? 0) >= 0 ? "up" : "down";
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors duration-200">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {change !== undefined && (
        <p className={`text-sm mt-2 flex items-center gap-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
          {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}% vs previous period
        </p>
      )}
    </div>
  );
}

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  APPROVE: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  VERIFY: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  ACTIVATE: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  REJECT: <XCircle className="w-5 h-5 text-red-500" />,
  SUSPEND: <XCircle className="w-5 h-5 text-yellow-500" />,
  DELETE: <XCircle className="w-5 h-5 text-red-500" />,
  TIER_CHANGE: <Layers className="w-5 h-5 text-violet-500" />,
  PRICING_APPROVE: <DollarSign className="w-5 h-5 text-green-500" />,
  PRICING_REJECT: <DollarSign className="w-5 h-5 text-red-500" />,
  REQUEST_CHANGES: <FileEdit className="w-5 h-5 text-orange-500" />,
  LOGIN: <LogIn className="w-5 h-5 text-muted-foreground" />,
  LOGOUT: <LogOutIcon className="w-5 h-5 text-muted-foreground" />,
  CREATE: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  UPDATE: <FileEdit className="w-5 h-5 text-blue-500" />,
};

const ACTION_VERBS: Record<string, string> = {
  APPROVE: "approved",
  VERIFY: "verified",
  ACTIVATE: "reactivated",
  REJECT: "rejected",
  SUSPEND: "suspended",
  DELETE: "deleted",
  TIER_CHANGE: "changed the tier of",
  PRICING_APPROVE: "approved pricing for",
  PRICING_REJECT: "rejected pricing for",
  REQUEST_CHANGES: "requested changes on",
  LOGIN: "logged in",
  LOGOUT: "logged out",
  CREATE: "created",
  UPDATE: "updated",
};

const RESOURCE_LABELS: Record<string, string> = {
  client: "a client",
  creator: "a creator",
  creator_application: "a creator application",
  creator_tier: "a creator tier",
  project: "a project",
  membership: "a membership",
  payment: "a payment",
  booking: "a booking",
  cms: "content",
  user: "a user",
  admin: "an admin action",
};

function describeActivity(log: any): string {
  const verb = ACTION_VERBS[log.action] || log.action.toLowerCase();
  if (log.action === "LOGIN" || log.action === "LOGOUT") return `${log.userEmail} ${verb}`;
  const resource = RESOURCE_LABELS[log.resource] || log.resource;
  return `${log.userEmail} ${verb} ${resource}`;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AdminDashboard() {
  const [dateRange, setDateRange] = useState<"day" | "week" | "month" | "year">("month");
  const { data, loading, error, lastUpdated, refetch } = useDashboard(dateRange);

  const kpis = data?.kpis;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Platform overview and real-time metrics"}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {(["day", "week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error state — distinct from a real zero: the dashboard never shows
          fabricated numbers when a fetch actually fails. */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-500">Unable to load dashboard data</p>
            <p className="text-sm text-red-500/80 mt-1">{error}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/30 flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !data && !error && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      )}

      {data && (
        <>
          {/* Section 1: Operational Overview */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Operational Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Total Clients" value={kpis.totalClients?.value ?? 0} change={kpis.totalClients?.change} />
              <KPICard label="Total Creators" value={kpis.totalCreators?.value ?? 0} change={kpis.totalCreators?.change} />
              <KPICard label="Active Projects" value={kpis.activeProjects?.value ?? 0} change={kpis.activeProjects?.change} />
              <KPICard label="Pending Applications" value={data.pendingApplications ?? 0} />
            </div>
          </div>

          {/* Section 2: Creator Network + Project Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="Creator Network"
              action={
                <Link to="/admin/creator-tiers" className="text-sm text-primary hover:underline">
                  Manage tiers
                </Link>
              }
            >
              {data.tierDistribution?.tiers?.length > 0 ? (
                <div className="space-y-3">
                  {data.tierDistribution.tiers.map((t: any) => (
                    <div key={t.tierId} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.name}</span>
                      <span className="text-lg font-bold">{t.count}</span>
                    </div>
                  ))}
                  {data.tierDistribution.unassigned > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                      <span className="text-lg font-bold">{data.tierDistribution.unassigned}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No creator tiers configured yet.</p>
              )}
            </SectionCard>

            <SectionCard
              title="Project Pipeline"
              action={
                <Link to="/admin/projects" className="text-sm text-primary hover:underline">
                  View projects
                </Link>
              }
            >
              {data.projectPipeline?.some((s: any) => s.count > 0) ? (
                <div className="space-y-2">
                  {data.projectPipeline.map((s: any) => (
                    <div key={s.stage} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-28 capitalize">{s.stage}</span>
                      <div className="flex-1 bg-background rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              kpis.totalProjects?.value ? (s.count / kpis.totalProjects.value) * 100 : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-6 text-right">{s.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No projects yet.</p>
              )}
            </SectionCard>
          </div>

          {/* Section 3: Financial Overview */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Financial Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard label="Gross Project Value" value={formatCurrency(kpis.totalRevenue?.value)} change={kpis.totalRevenue?.change} />
              <KPICard label="CC Commission (25%)" value={formatCurrency(kpis.commission?.value)} change={kpis.commission?.change} />
              <KPICard label="Creator Payouts" value={formatCurrency(kpis.creatorPayouts?.value)} change={kpis.creatorPayouts?.change} />
              <KPICard label="Transactions" value={kpis.transactions?.value ?? 0} change={kpis.transactions?.change} />
            </div>
            <SectionCard title="Revenue Over Time">
              {data.revenueOverTime?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.revenueOverTime}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                      labelStyle={{ color: "#f3f4f6" }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-12 text-center">No payments recorded yet.</p>
              )}
            </SectionCard>
          </div>

          {/* Section 4: Recent Activity + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="Recent Activity"
              action={
                <Link to="/admin/audit-logs" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              }
            >
              {data.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {data.recentActivity.map((log: any) => (
                    <div key={log._id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                      {ACTIVITY_ICONS[log.action] || <FileEdit className="w-5 h-5 text-muted-foreground" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{describeActivity(log)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(log.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              )}
            </SectionCard>

            <SectionCard title="Quick Actions">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/admin/creator-applications"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors text-center"
                >
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Review Applications</span>
                </Link>
                <Link
                  to="/admin/creators"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors text-center"
                >
                  <UserCheck className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Manage Creators</span>
                </Link>
                <Link
                  to="/admin/clients"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors text-center"
                >
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Manage Clients</span>
                </Link>
                <Link
                  to="/admin/projects"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors text-center"
                >
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">View Projects</span>
                </Link>
                <Link
                  to="/admin/creator-tiers"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors text-center"
                >
                  <Layers className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Creator Tiers</span>
                </Link>
                <Link
                  to="/admin/audit-logs"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors text-center"
                >
                  <ScrollText className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Audit Logs</span>
                </Link>
              </div>
            </SectionCard>
          </div>

          {/* Section 5: Detailed Metrics */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Detailed Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Verified Creators" value={kpis.verifiedCreators?.value ?? 0} change={kpis.verifiedCreators?.change} />
              <KPICard label="Creators Awaiting Verification" value={kpis.pendingCreators?.value ?? 0} change={kpis.pendingCreators?.change} />
              <KPICard label="Premium Members" value={kpis.premiumClients?.value ?? 0} change={kpis.premiumClients?.change} />
              <KPICard label="Completed Projects" value={kpis.completedProjects?.value ?? 0} change={kpis.completedProjects?.change} />
              <KPICard label="Strategy Calls" value={kpis.bookings?.value ?? 0} change={kpis.bookings?.change} />
              <KPICard
                label="Creator Rating"
                value={kpis.creatorRating?.value ? `${kpis.creatorRating.value.toFixed(1)}/5.0` : "No ratings yet"}
              />
              <KPICard
                label="Client Conversion"
                value={data.funnel?.conversionRate != null ? `${data.funnel.conversionRate.toFixed(1)}%` : "0%"}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
