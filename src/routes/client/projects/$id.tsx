import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, ArrowLeft, Star } from "lucide-react";
import { useClientProject } from "@/hooks/useClientAPI";
import { clientAPI } from "@/services/api";

export const Route = createFileRoute("/client/projects/$id")({
  head: () => ({
    meta: [{ title: "Project - Client" }],
  }),
  component: ClientProjectDetail,
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

const STATUS_STYLES: Record<string, string> = {
  enquiry: "bg-gray-500/20 text-gray-500",
  requirements: "bg-blue-500/20 text-blue-500",
  review: "bg-yellow-500/20 text-yellow-500",
  quoted: "bg-purple-500/20 text-purple-500",
  approved: "bg-cyan-500/20 text-cyan-500",
  active: "bg-green-500/20 text-green-500",
  completed: "bg-emerald-500/20 text-emerald-500",
  archived: "bg-slate-500/20 text-slate-500",
};

const TIMELINE_STEPS = ["enquiry", "requirements", "review", "quoted", "approved", "active", "completed"];

function ClientProjectDetail() {
  const { id } = useParams({ from: "/client/projects/$id" });
  const { data: project, loading, error, refetch } = useClientProject(id);
  const [actionError, setActionError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleQuotationAction = async (action: "approve_quotation" | "reject_quotation") => {
    try {
      setActionError(null);
      setActing(true);
      await clientAPI.updateProject(id, { action });
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setActing(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) {
      setReviewError("Please select a rating.");
      return;
    }
    try {
      setReviewSaving(true);
      setReviewError(null);
      await clientAPI.submitProjectReview(id, { rating: reviewRating, feedback: reviewFeedback });
      refetch();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setReviewSaving(false);
    }
  };

  const currentStepIndex = project ? TIMELINE_STEPS.indexOf(project.status) : -1;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/client/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {loading && !project && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-500">Unable to load project</p>
            <p className="text-sm text-red-500/80 mt-1">{error}</p>
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/30">
            Retry
          </button>
        </div>
      )}

      {actionError && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-500">{actionError}</div>}

      {project && (
        <>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.displayCode || project.projectCode} · {project.creatorId?.companyName || "Awaiting creator match"}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[project.status] || ""}`}>{project.status}</span>
            </div>

            <p className="mt-4 text-muted-foreground">{project.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Budget</p>
                <p className="text-lg font-semibold">{formatCurrency(project.budget)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Timeline</p>
                <p className="text-lg font-semibold">{new Date(project.timeline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Progress</p>
                <p className="text-lg font-semibold">{project.execution?.progress ?? 0}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Payment</p>
                <p className="text-lg font-semibold capitalize">{project.payment?.status || "pending"}</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-2">Requirements</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.enquiry?.requirements || "—"}</p>
          </div>

          {/* Quotation */}
          {project.quotation && project.quotation.amount > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Quotation</h2>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-2xl font-bold text-gradient">{formatCurrency(project.quotation.amount)}</p>
                  {project.quotation.validUntil && (
                    <p className="text-xs text-muted-foreground mt-1">Valid until {new Date(project.quotation.validUntil).toLocaleDateString()}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 capitalize">Status: {project.quotation.status}</p>
                </div>
                {project.quotation.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleQuotationAction("reject_quotation")}
                      disabled={acting}
                      className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-background disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleQuotationAction("approve_quotation")}
                      disabled={acting}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Project Timeline</h2>
            <div className="flex items-center flex-wrap gap-2">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                      i <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                  {i < TIMELINE_STEPS.length - 1 && <div className="w-4 h-px bg-border" />}
                </div>
              ))}
            </div>
          </div>

          {/* Review */}
          {project.status === "completed" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Review this project</h2>
              {project.review?.rating ? (
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-5 h-5 ${n <= project.review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{project.review.clientFeedback}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  {reviewError && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-500">{reviewError}</div>}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => setReviewRating(n)}>
                        <Star className={`w-6 h-6 ${n <= reviewRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    rows={3}
                    placeholder="How was your experience?"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  />
                  <button
                    type="submit"
                    disabled={reviewSaving}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {reviewSaving ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
