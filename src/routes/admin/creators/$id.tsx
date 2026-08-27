import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, RefreshCw, AlertCircle, Check, X, Lock } from "lucide-react";
import { useCreator, useCreatorPricingHistory, useCreatorTiers } from "@/hooks/useAdminAPI";
import { adminAPI } from "@/services/api";

export const Route = createFileRoute("/admin/creators/$id")({
  component: CreatorDetail,
});

function CreatorDetail() {
  const { id } = Route.useParams();
  const { data: creator, loading, error, refetch } = useCreator(id);
  const { data: pricingData, refetch: refetchPricing } = useCreatorPricingHistory(id);
  const { data: tiersData } = useCreatorTiers();

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedTierId, setSelectedTierId] = useState("");
  const [tierReason, setTierReason] = useState("");
  const [pricingAmount, setPricingAmount] = useState("");
  const [pricingReason, setPricingReason] = useState("");

  const tiers = tiersData?.tiers || [];

  const runAction = async (fn: () => Promise<any>, successMsg: string) => {
    try {
      setActionLoading(true);
      setActionError(null);
      setSuccessMessage(null);
      await fn();
      setSuccessMessage(successMsg);
      refetch();
      refetchPricing();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = () => runAction(() => adminAPI.verifyCreator(id), "Creator verified");
  const handleReject = () => runAction(() => adminAPI.rejectCreator(id, "Rejected by admin"), "Creator rejected");
  const handleSuspend = () => runAction(() => adminAPI.suspendCreator(id, "Suspended by admin"), "Creator suspended");

  const handleTierChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTierId) {
      setActionError("Select a tier");
      return;
    }
    if (!tierReason.trim()) {
      setActionError("A reason is required for tier changes");
      return;
    }
    runAction(
      () => adminAPI.changeCreatorTier(id, { tierId: selectedTierId, reason: tierReason }),
      "Tier updated"
    ).then(() => setTierReason(""));
  };

  const handlePricingApprove = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(pricingAmount);
    if (!amount || amount <= 0) {
      setActionError("Enter a valid amount");
      return;
    }
    if (!pricingReason.trim()) {
      setActionError("A reason is required for pricing changes");
      return;
    }
    runAction(
      () => adminAPI.approveCreatorPricing(id, { approvedAmount: amount, reason: pricingReason }),
      "Pricing updated"
    ).then(() => {
      setPricingAmount("");
      setPricingReason("");
    });
  };

  const handlePricingReject = () => {
    if (!pricingReason.trim()) {
      setActionError("A reason is required to reject pricing");
      return;
    }
    runAction(() => adminAPI.rejectCreatorPricing(id, pricingReason), "Pricing rejected").then(() =>
      setPricingReason("")
    );
  };

  if (loading && !creator) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading creator...</p>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-500">Error loading creator</p>
          <p className="text-sm text-red-500/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/creators" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to creators
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {creator.userId?.firstName} {creator.userId?.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">{creator.companyName}</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              creator.verification?.status === "verified"
                ? "bg-green-500/20 text-green-500"
                : creator.verification?.status === "pending"
                ? "bg-yellow-500/20 text-yellow-500"
                : "bg-red-500/20 text-red-500"
            }`}
          >
            {creator.verification?.status || "pending"}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-500 text-sm">{successMessage}</div>
      )}
      {actionError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-500">{actionError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-bold">Profile</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Email</p>
                <p>{creator.userId?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Location</p>
                <p>{creator.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Experience</p>
                <p>{creator.experience} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Rating</p>
                <p>{creator.performance?.averageRating?.toFixed(1) || 0}/5</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Active Projects</p>
                <p>{creator.stats?.activeProjects ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Completed Projects</p>
                <p>{creator.stats?.completedProjects ?? 0}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Bio</p>
              <p className="text-sm mt-1">{creator.bio || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Skills</p>
              <p className="text-sm mt-1">{creator.skills?.join(", ") || "—"}</p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-border">
              {creator.verification?.status === "pending" && (
                <>
                  <button
                    onClick={handleVerify}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-sm hover:bg-green-500/20 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Verify
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </>
              )}
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm hover:bg-yellow-500/20 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" /> Suspend
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Pricing History</h2>
            {pricingData?.history?.length > 0 ? (
              <div className="space-y-2">
                {pricingData.history
                  .slice()
                  .reverse()
                  .map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3 bg-background rounded-lg border border-border text-sm">
                      <div>
                        <p>
                          {entry.previousAmount != null ? `₹${entry.previousAmount} → ` : ""}₹{entry.newAmount}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.reason} — by {entry.changedBy?.firstName || "admin"} on{" "}
                          {new Date(entry.changedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pricing changes recorded yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">Tier</h2>
            <p className="text-sm text-muted-foreground mb-3">Current: {creator.tierId?.name || "Not assigned"}</p>
            <form onSubmit={handleTierChange} className="space-y-2">
              <select
                value={selectedTierId}
                onChange={(e) => setSelectedTierId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="">Select new tier</option>
                {tiers.map((t: any) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <input
                value={tierReason}
                onChange={(e) => setTierReason(e.target.value)}
                placeholder="Reason for change"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                Update Tier
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">Pricing</h2>
            <p className="text-sm text-muted-foreground mb-1">
              Proposed: {creator.pricing?.proposedAmount != null ? `₹${creator.pricing.proposedAmount}` : "—"}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Approved: {creator.pricing?.approvedAmount != null ? `₹${creator.pricing.approvedAmount}` : "Not set"} (
              {creator.pricing?.status || "pending"})
            </p>
            <form onSubmit={handlePricingApprove} className="space-y-2">
              <input
                type="number"
                min={0}
                value={pricingAmount}
                onChange={(e) => setPricingAmount(e.target.value)}
                placeholder="New approved amount (₹)"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
              <input
                value={pricingReason}
                onChange={(e) => setPricingReason(e.target.value)}
                placeholder="Reason"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm hover:bg-green-500/20 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={handlePricingReject}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
