import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, Star, Heart, ArrowLeft } from "lucide-react";
import { useClientCreatorDetails } from "@/hooks/useClientAPI";
import { clientAPI } from "@/services/api";

export const Route = createFileRoute("/client/marketplace/$creatorId")({
  head: () => ({
    meta: [{ title: "Creator Profile - Client" }],
  }),
  component: CreatorDetail,
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function CreatorDetail() {
  const { creatorId } = useParams({ from: "/client/marketplace/$creatorId" });
  const { data: creator, loading, error, refetch } = useClientCreatorDetails(creatorId);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      setActionError(null);
      setSaving(true);
      await clientAPI.saveCreator(creatorId);
      setSaved(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save creator");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/client/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Creators
      </Link>

      {loading && !creator && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading creator...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-500">Unable to load creator</p>
            <p className="text-sm text-red-500/80 mt-1">{error}</p>
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/30">
            Retry
          </button>
        </div>
      )}

      {actionError && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-500">{actionError}</div>}

      {creator && (
        <>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-brand-gradient flex items-center justify-center text-primary-foreground font-bold text-2xl flex-shrink-0 overflow-hidden">
                  {creator.profilePhoto ? (
                    <img src={creator.profilePhoto} alt={creator.companyName} className="w-full h-full object-cover" />
                  ) : (
                    (creator.companyName?.[0] || "C").toUpperCase()
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{creator.companyName}</h1>
                  <p className="text-muted-foreground">{creator.location}</p>
                  {creator.tierId?.name && <p className="text-sm text-muted-foreground mt-1">Tier: {creator.tierId.name}</p>}
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-background disabled:opacity-60"
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-current text-primary" : ""}`} /> {saved ? "Saved" : "Save"}
              </button>
            </div>

            <div className="flex items-center gap-6 mt-6 flex-wrap">
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{(creator.performance?.averageRating || 0).toFixed(1)}</span>
                <span className="text-muted-foreground">({creator.performance?.completedProjects || 0} completed projects)</span>
              </div>
              <span className="text-sm text-muted-foreground">{creator.experience || 0} years experience</span>
              {creator.pricing?.amount != null && (
                <span className="text-sm font-semibold text-gradient">From {formatCurrency(creator.pricing.amount)}</span>
              )}
            </div>

            <p className="mt-6 text-muted-foreground">{creator.bio}</p>

            {creator.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {creator.skills.map((s: string) => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs bg-secondary/50 text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {Array.isArray(creator.portfolio) && creator.portfolio.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {creator.portfolio
                  .filter((p: any) => p.status === "approved")
                  .map((p: any) => (
                    <div key={p._id} className="bg-background border border-border rounded-lg overflow-hidden">
                      {p.media?.url && (
                        <div className="aspect-video bg-muted overflow-hidden">
                          {p.media.type === "video" ? (
                            <video src={p.media.url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={p.media.url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                          )}
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
              {creator.portfolio.filter((p: any) => p.status === "approved").length === 0 && (
                <p className="text-sm text-muted-foreground">No approved portfolio items yet.</p>
              )}
            </div>
          )}

          {Array.isArray(creator.packages) && creator.packages.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {creator.packages
                  .filter((p: any) => p.status === "active")
                  .map((p: any) => (
                    <div key={p._id} className="bg-background border border-border rounded-lg p-4">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                      <p className="text-lg font-bold text-gradient mt-2">{formatCurrency(p.price)}</p>
                      <p className="text-xs text-muted-foreground">{p.timeline} day timeline</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-medium">Ready to work with {creator.companyName}?</p>
              <p className="text-sm text-muted-foreground mt-1">CC handles the relationship — submit a request and we'll take it from there.</p>
            </div>
            <Link
              to="/client/projects"
              search={{ creatorId }}
              className="px-6 py-3 bg-brand-gradient text-primary-foreground rounded-lg text-sm font-semibold hover:scale-[1.02] transition-transform"
            >
              Request through CC
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
