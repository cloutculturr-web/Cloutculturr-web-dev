import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, Heart, Star, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useClientMarketplace } from "@/hooks/useClientAPI";
import { clientAPI } from "@/services/api";

export const Route = createFileRoute("/client/marketplace/")({
  head: () => ({
    meta: [{ title: "Creators - Client" }],
  }),
  component: ClientMarketplace,
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

const AVAILABILITY_STYLES: Record<string, string> = {
  available: "bg-green-500/20 text-green-500",
  busy: "bg-yellow-500/20 text-yellow-500",
  unavailable: "bg-red-500/20 text-red-500",
};

function ClientMarketplace() {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useClientMarketplace(page);
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const creators = Array.isArray(data?.creators) ? data.creators : [];
  const pagination = data?.pagination;

  const handleSave = async (creatorId: string) => {
    try {
      setActionError(null);
      setSavingIds((prev) => ({ ...prev, [creatorId]: true }));
      await clientAPI.saveCreator(creatorId);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save creator");
    } finally {
      setSavingIds((prev) => ({ ...prev, [creatorId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Creators</h1>
          <p className="text-muted-foreground mt-1">Vetted, CC-approved creators — request one through CC to start a project</p>
        </div>
        <button onClick={() => refetch()} disabled={loading} className="p-2 hover:bg-card rounded-lg border border-border disabled:opacity-50">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {!pagination?.isPremium && pagination && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm">
            You're on the Free plan — showing up to {pagination.limit} creators.{" "}
            <Link to="/client/membership" className="text-primary font-medium hover:underline">
              Upgrade to Premium
            </Link>{" "}
            for unlimited access.
          </p>
        </div>
      )}

      {actionError && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-500">{actionError}</div>}

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading creators...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Unable to load creators</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creators.length > 0 ? (
              creators.map((c: any) => (
                <div key={c.userId} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-brand-gradient flex items-center justify-center text-primary-foreground font-bold flex-shrink-0 overflow-hidden">
                          {c.profilePhoto ? (
                            <img src={c.profilePhoto} alt={c.companyName} className="w-full h-full object-cover" />
                          ) : (
                            (c.companyName?.[0] || "C").toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{c.companyName}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.location}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(c.userId)}
                        disabled={savingIds[c.userId]}
                        className="p-1.5 hover:bg-background rounded-lg flex-shrink-0 disabled:opacity-50"
                        title="Save creator"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{c.bio}</p>

                    {c.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {c.skills.slice(0, 3).map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-secondary/50 text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm pt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{(c.performance?.averageRating || 0).toFixed(1)}</span>
                        <span className="text-muted-foreground">({c.performance?.completedProjects || 0} projects)</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${AVAILABILITY_STYLES[c.availability] || ""}`}>
                        {c.availability}
                      </span>
                    </div>

                    {c.tierId?.name && (
                      <p className="text-xs text-muted-foreground">Tier: {c.tierId.name}</p>
                    )}

                    {c.pricing?.amount != null && (
                      <p className="text-sm font-semibold text-gradient">From {formatCurrency(c.pricing.amount)}</p>
                    )}

                    <Link
                      to="/client/marketplace/$creatorId"
                      params={{ creatorId: c.userId }}
                      className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                No creators available right now.
              </div>
            )}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 border border-border rounded-lg disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => (pagination.pages ? Math.min(pagination.pages, p + 1) : p + 1))}
                disabled={page >= pagination.pages || (!pagination.isPremium && pagination.remainingCreators <= 0)}
                className="p-2 border border-border rounded-lg disabled:opacity-40"
              >
                {!pagination.isPremium && pagination.remainingCreators <= 0 ? <Lock className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
