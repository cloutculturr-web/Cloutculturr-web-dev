import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, Plus, Trash2, Pencil } from "lucide-react";
import { useCreatorPackages } from "@/hooks/useCreatorAPI";
import { creatorAPI } from "@/services/api";

export const Route = createFileRoute("/creator/services/")({
  component: CreatorServices,
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

interface FormState {
  name: string;
  description: string;
  price: string;
  timeline: string;
  reels: string;
  posts: string;
  stories: string;
  revisions: string;
}

const emptyForm: FormState = { name: "", description: "", price: "", timeline: "", reels: "0", posts: "0", stories: "0", revisions: "0" };

function CreatorServices() {
  const { data, loading, error, refetch } = useCreatorPackages();
  const packages = Array.isArray(data) ? data : [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const startEdit = (pkg: any) => {
    setEditingId(pkg._id);
    setForm({
      name: pkg.name,
      description: pkg.description,
      price: String(pkg.price),
      timeline: String(pkg.timeline),
      reels: String(pkg.deliverables?.reels ?? 0),
      posts: String(pkg.deliverables?.posts ?? 0),
      stories: String(pkg.deliverables?.stories ?? 0),
      revisions: String(pkg.deliverables?.revisions ?? 0),
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const timeline = Number(form.timeline);
    if (!form.name || !form.description || !price || price <= 0 || !timeline || timeline < 1) {
      setFormError("Name, description, a positive price, and a timeline (in days) are required.");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const payload = {
        name: form.name,
        description: form.description,
        price,
        timeline,
        deliverables: {
          reels: Number(form.reels) || 0,
          posts: Number(form.posts) || 0,
          stories: Number(form.stories) || 0,
          revisions: Number(form.revisions) || 0,
        },
      };
      if (editingId) {
        await creatorAPI.updatePackage(editingId, payload);
      } else {
        await creatorAPI.createPackage(payload as any);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service package? This cannot be undone.")) return;
    try {
      setActionError(null);
      await creatorAPI.deletePackage(id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete service");
    }
  };

  const inputClass = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm";
  const labelClass = "block text-xs font-medium mb-1";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">Your packages, pricing, and deliverables</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} disabled={loading} className="p-2 hover:bg-card rounded-lg border border-border disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>
      </div>

      {actionError && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-500">{actionError}</div>}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Package" : "Add Package"}</h2>
            {formError && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 text-sm text-red-500">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={labelClass}>Package Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Price (₹)</label>
                  <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Timeline (days)</label>
                  <input type="number" min={1} value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Reels</label>
                  <input type="number" min={0} value={form.reels} onChange={(e) => setForm({ ...form, reels: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Posts</label>
                  <input type="number" min={0} value={form.posts} onChange={(e) => setForm({ ...form, posts: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Stories</label>
                  <input type="number" min={0} value={form.stories} onChange={(e) => setForm({ ...form, stories: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Revisions</label>
                  <input type="number" min={0} value={form.revisions} onChange={(e) => setForm({ ...form, revisions: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-card">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Unable to load services</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.length > 0 ? (
            packages.map((pkg: any) => (
              <div key={pkg._id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{pkg.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pkg.status === "active" ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
                    {pkg.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                <p className="text-lg font-bold text-gradient">{formatCurrency(pkg.price)}</p>
                <p className="text-xs text-muted-foreground">{pkg.timeline} day timeline</p>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => startEdit(pkg)} className="p-1.5 hover:bg-background rounded-lg" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(pkg._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
              No service packages yet. Add one so CC/clients know what you offer.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
