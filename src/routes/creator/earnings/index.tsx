import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useCreatorEarnings } from "@/hooks/useCreatorAPI";

export const Route = createFileRoute("/creator/earnings/")({
  component: CreatorEarnings,
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  successful: "bg-green-500/20 text-green-500",
  pending: "bg-yellow-500/20 text-yellow-500",
  failed: "bg-red-500/20 text-red-500",
  refunded: "bg-slate-500/20 text-slate-500",
  initiated: "bg-blue-500/20 text-blue-500",
};

function CreatorEarnings() {
  const { data, loading, error, refetch } = useCreatorEarnings();
  const payments = Array.isArray(data?.payments) ? data.payments : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground mt-1">Your real payment history — CC's 25% commission is already deducted</p>
        </div>
        <button onClick={() => refetch()} disabled={loading} className="p-2 hover:bg-card rounded-lg border border-border disabled:opacity-50">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading earnings...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-500">Unable to load earnings</p>
            <p className="text-sm text-red-500/80 mt-1">{error}</p>
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/30">
            Retry
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
              <p className="text-3xl font-bold">{formatCurrency(data.totalEarnings)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-2">Paid</p>
              <p className="text-3xl font-bold text-green-500">{formatCurrency(data.paidEarnings)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-2">Pending</p>
              <p className="text-3xl font-bold text-yellow-500">{formatCurrency(data.pendingEarnings)}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Project</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Gross Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">CC Commission</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Your Share</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.length > 0 ? (
                  payments.map((p: any) => (
                    <tr key={p._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 text-sm">{p.projectId?.title || "—"}</td>
                      <td className="px-6 py-4 text-sm">{formatCurrency(p.amount)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatCurrency(p.breakdown?.commission)}</td>
                      <td className="px-6 py-4 text-sm font-medium">{formatCurrency(p.breakdown?.creatorShare)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_STYLES[p.status] || ""}`}>{p.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
