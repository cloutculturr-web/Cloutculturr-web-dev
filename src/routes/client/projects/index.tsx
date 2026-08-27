import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, AlertCircle, Plus } from "lucide-react";
import { useClientProjects } from "@/hooks/useClientAPI";
import { clientAPI } from "@/services/api";

type Search = { creatorId?: string };

export const Route = createFileRoute("/client/projects/")({
  head: () => ({
    meta: [{ title: "My Projects - Client" }],
  }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    creatorId: typeof search.creatorId === "string" ? search.creatorId : undefined,
  }),
  component: ClientProjects,
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

const STATUS_FILTERS = ["enquiry", "requirements", "review", "quoted", "approved", "active", "completed", "archived"];

interface FormState {
  title: string;
  description: string;
  budget: string;
  requirements: string;
  timeline: string;
}

const emptyForm: FormState = { title: "", description: "", budget: "", requirements: "", timeline: "" };

function ClientProjects() {
  const { creatorId } = Route.useSearch();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data, loading, error, refetch } = useClientProjects(status);
  const projects = Array.isArray(data) ? data : [];

  const [showForm, setShowForm] = useState(!!creatorId);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budget = Number(form.budget);
    if (!form.title || !form.description || !budget || budget <= 0 || !form.requirements || !form.timeline) {
      setFormError("Title, description, a positive budget, requirements and a timeline are all required.");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      await clientAPI.createProject({
        title: form.title,
        description: form.description,
        budget,
        requirements: form.requirements,
        timeline: new Date(form.timeline).toISOString(),
        creatorId,
      });
      setShowForm(false);
      setForm(emptyForm);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit project request");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm";
  const labelClass = "block text-xs font-medium mb-1";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">Requests you've submitted through CC</p>
        </div>
        <div className="flex gap-2">
          <select
            value={status || ""}
            onChange={(e) => setStatus(e.target.value || undefined)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={() => refetch()} disabled={loading} className="p-2 hover:bg-card rounded-lg border border-border disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> Start a Project
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Start a Project</h2>
            {creatorId && <p className="text-sm text-muted-foreground mb-4">CC will review this alongside your preferred creator.</p>}
            {formError && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 text-sm text-red-500">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={labelClass}>Project Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Budget (₹)</label>
                  <input type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Preferred Timeline (by)</label>
                  <input type="date" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  rows={4}
                  placeholder="Tell CC what you need — goals, brand, deliverables, anything relevant"
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-card">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
                  {saving ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Unable to load projects</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Project</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Creator</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Budget</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.length > 0 ? (
                projects.map((p: any) => (
                  <tr key={p._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <Link to="/client/projects/$id" params={{ id: p._id }} className="hover:underline">
                        <span className="font-medium">{p.title}</span>
                        <span className="block text-xs text-muted-foreground">{p.displayCode || p.projectCode}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{p.creatorId?.companyName || "Awaiting match"}</td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(p.budget)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[p.status] || ""}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No projects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
