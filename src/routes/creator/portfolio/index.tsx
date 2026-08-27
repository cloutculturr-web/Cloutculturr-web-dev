import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, Plus, Trash2, Pencil } from "lucide-react";
import { useCreatorPortfolio } from "@/hooks/useCreatorAPI";
import { creatorAPI } from "@/services/api";

export const Route = createFileRoute("/creator/portfolio/")({
  component: CreatorPortfolio,
});

const CATEGORIES = ["photography", "reels", "posts", "design", "video", "campaign"];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-500/20 text-yellow-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
};

interface FormState {
  title: string;
  description: string;
  category: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  clientName: string;
  challenge: string;
  solution: string;
  results: string;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  category: "photography",
  mediaType: "image",
  mediaUrl: "",
  clientName: "",
  challenge: "",
  solution: "",
  results: "",
};

function CreatorPortfolio() {
  const { data, loading, error, refetch } = useCreatorPortfolio();
  const items = Array.isArray(data) ? data : [];

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

  const startEdit = (item: any) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      mediaType: item.media?.type || "image",
      mediaUrl: item.media?.url || "",
      clientName: item.projectDetails?.clientName || "",
      challenge: item.projectDetails?.challenge || "",
      solution: item.projectDetails?.solution || "",
      results: item.projectDetails?.results || "",
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.mediaUrl || !form.clientName || !form.challenge || !form.solution || !form.results) {
      setFormError("All fields are required.");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        media: { type: form.mediaType, url: form.mediaUrl },
        projectDetails: {
          clientName: form.clientName,
          challenge: form.challenge,
          solution: form.solution,
          results: form.results,
        },
      };
      if (editingId) {
        await creatorAPI.updatePortfolioItem(editingId, payload);
      } else {
        await creatorAPI.addPortfolioItem(payload as any);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save portfolio item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this portfolio item? This cannot be undone.")) return;
    try {
      setActionError(null);
      await creatorAPI.deletePortfolioItem(id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete portfolio item");
    }
  };

  const inputClass = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm";
  const labelClass = "block text-xs font-medium mb-1";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">New and edited items go through CC review before they're marked approved</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} disabled={loading} className="p-2 hover:bg-card rounded-lg border border-border disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {actionError && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-sm text-red-500">{actionError}</div>}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Portfolio Item" : "Add Portfolio Item"}</h2>
            {formError && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 text-sm text-red-500">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={labelClass}>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Media Type</label>
                  <select value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value as "image" | "video" })} className={inputClass}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Media URL</label>
                <input value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} placeholder="https://" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Client Name</label>
                <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Challenge</label>
                <textarea value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} rows={2} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Solution</label>
                <textarea value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} rows={2} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Results</label>
                <textarea value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} rows={2} className={inputClass} />
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
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Unable to load portfolio</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length > 0 ? (
            items.map((item: any) => (
              <div key={item._id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_STYLES[item.status] || ""}`}>
                      {(item.status || "pending_review").replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => startEdit(item)} className="p-1.5 hover:bg-background rounded-lg" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg" title="Delete">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
              No portfolio items yet. Add your first one to start building your profile.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
