import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, Pencil, Plus } from "lucide-react";
import { useCreatorTiers } from "@/hooks/useAdminAPI";
import { adminAPI } from "@/services/api";

export const Route = createFileRoute("/admin/creator-tiers/")({
  component: CreatorTiersPage,
});

interface TierFormState {
  name: string;
  description: string;
  min: string;
  max: string;
  currency: string;
  eligibilityCriteria: string;
  status: "active" | "inactive";
}

function toFormState(tier: any): TierFormState {
  return {
    name: tier?.name || "",
    description: tier?.description || "",
    min: tier?.pricingGuidance?.min ?? "",
    max: tier?.pricingGuidance?.max ?? "",
    currency: tier?.pricingGuidance?.currency || "INR",
    eligibilityCriteria: tier?.eligibilityCriteria || "",
    status: tier?.status || "active",
  };
}

function CreatorTiersPage() {
  const { data, loading, error, refetch } = useCreatorTiers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TierFormState>(toFormState(null));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [creatingLevel, setCreatingLevel] = useState<1 | 2 | 3 | null>(null);

  const tiers = data?.tiers || [];
  const existingLevels = new Set(tiers.map((t: any) => t.level));
  const missingLevels = ([1, 2, 3] as const).filter((l) => !existingLevels.has(l));

  const startEdit = (tier: any) => {
    setEditingId(tier._id);
    setForm(toFormState(tier));
    setSaveError(null);
  };

  const startCreate = (level: 1 | 2 | 3) => {
    setCreatingLevel(level);
    setForm({ ...toFormState(null), name: `Tier ${level}` });
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCreatingLevel(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveError(null);
      const payload = {
        name: form.name,
        description: form.description,
        eligibilityCriteria: form.eligibilityCriteria,
        status: form.status,
        pricingGuidance: {
          min: form.min === "" ? undefined : Number(form.min),
          max: form.max === "" ? undefined : Number(form.max),
          currency: form.currency,
        },
      };

      if (editingId) {
        await adminAPI.updateCreatorTier(editingId, payload);
      } else if (creatingLevel) {
        await adminAPI.createCreatorTier({ ...payload, level: creatingLevel });
      }

      setEditingId(null);
      setCreatingLevel(null);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save tier");
    } finally {
      setSaving(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSave} className="space-y-3 mt-4 pt-4 border-t border-border">
      {saveError && <p className="text-sm text-red-500">{saveError}</p>}
      <div>
        <label className="block text-xs font-medium mb-1">Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">Min Price</label>
          <input
            type="number"
            min={0}
            value={form.min}
            onChange={(e) => setForm({ ...form, min: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Max Price</label>
          <input
            type="number"
            min={0}
            value={form.max}
            onChange={(e) => setForm({ ...form, max: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Currency</label>
          <input
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Eligibility Criteria</label>
        <textarea
          value={form.eligibilityCriteria}
          onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })}
          rows={2}
          placeholder="What qualifies a creator for this tier?"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={cancelEdit}
          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-card"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creator Tiers</h1>
          <p className="text-muted-foreground mt-1">Configure tier names, pricing guidance, and eligibility</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading tiers...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier: any) => (
            <div key={tier._id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Level {tier.level}</p>
                  <h2 className="text-xl font-bold">{tier.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tier.status === "active" ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tier.status}
                  </span>
                  {editingId !== tier._id && (
                    <button onClick={() => startEdit(tier)} className="p-1.5 hover:bg-background rounded-lg" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {editingId === tier._id ? (
                renderForm()
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mt-2">{tier.description || "No description yet."}</p>
                  <p className="text-sm mt-3">
                    <span className="text-muted-foreground">Pricing guidance: </span>
                    {tier.pricingGuidance?.min != null || tier.pricingGuidance?.max != null
                      ? `${tier.pricingGuidance.currency} ${tier.pricingGuidance.min ?? "?"} – ${tier.pricingGuidance.max ?? "?"}`
                      : "Not configured"}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="text-muted-foreground">Eligibility: </span>
                    {tier.eligibilityCriteria || "Not configured"}
                  </p>
                </>
              )}
            </div>
          ))}

          {missingLevels.map((level) => (
            <div key={level} className="bg-card border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
              {creatingLevel === level ? (
                <div className="w-full text-left">{renderForm()}</div>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm mb-3">Tier {level} not configured</p>
                  <button
                    onClick={() => startCreate(level)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" /> Create
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
