import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, Star, Heart } from "lucide-react";
import { useClientSavedCreators } from "@/hooks/useClientAPI";
import { clientAPI } from "@/services/api";

export const Route = createFileRoute("/client/saved-creators/")({
  head: () => ({
    meta: [{ title: "Saved Creators - Client" }],
  }),
  component: SavedCreators,
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function SavedCreators() {
  const { data, loading, error, refetch } = useClientSavedCreators();
  const [actionError, setActionError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Record<string, boolean>>({});

  const creators = Array.isArray(data) ? data : [];

  const handleRemove = async (creatorId: string) => {
    try {
      setActionError(null);
      setRemovingIds((prev) => ({ ...prev, [creatorId]: true }));
      await clientAPI.unsaveCreator(creatorId);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to remove creator");
    } finally {
      setRemovingIds((prev) => ({ ...prev, [creatorId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Saved Creators</h1>
          <p className="text-muted-foreground mt-1">Creators you've bookmarked for later</p>
        </div>
        <button onClick={() => refetch()} disabled={loading} className="p-2 hover:bg-card rounded-lg border border-border disabled:opacity-50">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {actionError && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-500">{actionError}</div>}

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading saved creators...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Unable to load saved creators</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.length > 0 ? (
            creators.map((c: any) => (
              <div key={c.userId} className="bg-card border border-border rounded-xl p-4 space-y-3">
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
                    onClick={() => handleRemove(c.userId)}
                    disabled={removingIds[c.userId]}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg flex-shrink-0 disabled:opacity-50"
                    title="Remove"
                  >
                    <Heart className="w-4 h-4 fill-current text-primary" />
                  </button>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{(c.performance?.averageRating || 0).toFixed(1)}</span>
                </div>
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
            ))
          ) : (
            <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
              No saved creators yet.{" "}
              <Link to="/client/marketplace" className="text-primary hover:underline">
                Browse creators
              </Link>{" "}
              to save some for later.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
