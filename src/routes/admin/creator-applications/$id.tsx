import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, RefreshCw, AlertCircle, Download, CheckCircle2, XCircle, MessageSquareWarning } from "lucide-react";
import { useCreatorApplication, useCreatorTiers } from "@/hooks/useAdminAPI";
import { adminAPI } from "@/services/api";

export const Route = createFileRoute("/admin/creator-applications/$id")({
  component: CreatorApplicationDetail,
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  under_review: "bg-blue-500/20 text-blue-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
  changes_requested: "bg-orange-500/20 text-orange-500",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm mt-1">{value}</p>
    </div>
  );
}

function CreatorApplicationDetail() {
  const { id } = Route.useParams();
  const { data: application, loading, error, refetch } = useCreatorApplication(id);
  const { data: tiersData } = useCreatorTiers();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [approveResult, setApproveResult] = useState<{ temporaryPassword: string } | null>(null);

  const [tierId, setTierId] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [availability, setAvailability] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [changesNotes, setChangesNotes] = useState("");
  const [activeAction, setActiveAction] = useState<"approve" | "reject" | "changes" | null>(null);

  const tiers = tiersData?.tiers || [];

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tierId) {
      setActionError("Select a tier before approving");
      return;
    }
    const amount = Number(approvedAmount);
    if (!amount || amount <= 0) {
      setActionError("Enter a valid approved price");
      return;
    }
    try {
      setActionLoading(true);
      setActionError(null);
      const response = await adminAPI.approveCreatorApplication(id, { tierId, approvedAmount: amount, availability });
      setApproveResult({ temporaryPassword: response.data.temporaryPassword });
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setActionError("A rejection reason is required");
      return;
    }
    try {
      setActionLoading(true);
      setActionError(null);
      await adminAPI.rejectCreatorApplication(id, rejectReason);
      setActiveAction(null);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changesNotes.trim()) {
      setActionError("Notes describing the requested changes are required");
      return;
    }
    try {
      setActionLoading(true);
      setActionError(null);
      await adminAPI.requestCreatorApplicationChanges(id, changesNotes);
      setActiveAction(null);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to request changes");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      await adminAPI.downloadCreatorApplicationFile(id, fileId, filename);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to download file");
    }
  };

  if (loading && !application) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-500">Error loading application</p>
          <p className="text-sm text-red-500/80">{error}</p>
        </div>
      </div>
    );
  }

  const isDecided = application.status === "approved" || application.status === "rejected";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/creator-applications" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </Link>
          <h1 className="text-3xl font-bold">
            {application.firstName} {application.lastName}
          </h1>
          <p className="text-muted-foreground mt-1">{application.companyName}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_STYLES[application.status] || ""}`}>
          {application.status.replace("_", " ")}
        </span>
      </div>

      {approveResult && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 space-y-2">
          <p className="font-medium text-green-500 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Creator account created
          </p>
          <p className="text-sm text-foreground">
            One-time temporary password: <code className="bg-background px-2 py-1 rounded font-mono">{approveResult.temporaryPassword}</code>
          </p>
          <p className="text-xs text-muted-foreground">
            No email/SMTP integration is configured yet, so this password is not sent automatically — share it with
            the creator through a secure channel yourself. This is shown once and cannot be retrieved again.
          </p>
        </div>
      )}

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{actionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold">Application Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Email" value={application.email} />
              <InfoRow label="Phone" value={application.phoneNumber} />
              <InfoRow label="Location" value={application.location} />
              <InfoRow label="Experience" value={application.experience ? `${application.experience} years` : null} />
              <InfoRow label="Languages" value={application.languages?.join(", ")} />
              <InfoRow label="Skills" value={application.skills?.join(", ")} />
              <InfoRow label="Website" value={application.website} />
              <InfoRow
                label="Social"
                value={[application.socialMedia?.instagram, application.socialMedia?.linkedin, application.socialMedia?.twitter]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </div>
            <InfoRow label="Bio" value={application.bio} />
            <InfoRow label="Portfolio Links" value={application.portfolioLinks?.join(", ")} />
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Proposed Pricing" value={application.proposedPricing ? `₹${application.proposedPricing}` : "Not specified"} />
              <InfoRow label="Pricing Notes" value={application.pricingNotes} />
            </div>
            {application.rejectionReason && <InfoRow label="Rejection Reason" value={application.rejectionReason} />}
            {application.changesRequestedNotes && <InfoRow label="Changes Requested" value={application.changesRequestedNotes} />}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Portfolio Files</h2>
            {application.files && application.files.length > 0 ? (
              <div className="space-y-2">
                {application.files.map((file: any) => (
                  <div key={file._id} className="flex items-center justify-between px-4 py-3 bg-background rounded-lg border border-border">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={() => handleDownload(file._id, file.originalName)}
                      className="p-2 hover:bg-card rounded-lg transition-colors flex-shrink-0"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No files were attached to this application.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {!isDecided && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h2 className="text-lg font-bold">Decision</h2>
              <button
                onClick={() => setActiveAction(activeAction === "approve" ? null : "approve")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => setActiveAction(activeAction === "reject" ? null : "reject")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => setActiveAction(activeAction === "changes" ? null : "changes")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors"
              >
                <MessageSquareWarning className="w-4 h-4" /> Request Changes
              </button>

              {activeAction === "approve" && (
                <form onSubmit={handleApprove} className="pt-3 space-y-3 border-t border-border">
                  <div>
                    <label className="block text-xs font-medium mb-1">Tier *</label>
                    <select
                      value={tierId}
                      onChange={(e) => setTierId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      required
                    >
                      <option value="">Select a tier</option>
                      {tiers.map((t: any) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Approved Price (₹) *</label>
                    <input
                      type="number"
                      min={0}
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Availability</label>
                    <input
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder="e.g. 2 projects/month"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {actionLoading ? "Approving..." : "Confirm Approval"}
                  </button>
                </form>
              )}

              {activeAction === "reject" && (
                <form onSubmit={handleReject} className="pt-3 space-y-3 border-t border-border">
                  <div>
                    <label className="block text-xs font-medium mb-1">Rejection Reason *</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                  </button>
                </form>
              )}

              {activeAction === "changes" && (
                <form onSubmit={handleRequestChanges} className="pt-3 space-y-3 border-t border-border">
                  <div>
                    <label className="block text-xs font-medium mb-1">What needs to change? *</label>
                    <textarea
                      value={changesNotes}
                      onChange={(e) => setChangesNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {actionLoading ? "Sending..." : "Send Request"}
                  </button>
                </form>
              )}
            </div>
          )}

          {isDecided && (
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">
                This application has been {application.status}
                {application.reviewedAt ? ` on ${new Date(application.reviewedAt).toLocaleDateString()}` : ""}. No
                further action is available.
              </p>
              {application.creatorId && (
                <Link
                  to="/admin/creators/$id"
                  params={{ id: application.creatorId }}
                  className="inline-block mt-3 text-primary hover:underline text-sm"
                >
                  View creator profile →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
