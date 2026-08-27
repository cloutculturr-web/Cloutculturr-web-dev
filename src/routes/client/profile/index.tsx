import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useClientProfile } from "@/hooks/useClientAPI";
import { clientAPI } from "@/services/api";

export const Route = createFileRoute("/client/profile/")({
  head: () => ({
    meta: [{ title: "My Profile - Client" }],
  }),
  component: ClientProfile,
});

interface FormState {
  companyName: string;
  industry: string;
  location: string;
  websiteUrl: string;
  description: string;
}

const emptyForm: FormState = { companyName: "", industry: "", location: "", websiteUrl: "", description: "" };

function ClientProfile() {
  const { data, loading, error, refetch } = useClientProfile();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        companyName: data.companyName || "",
        industry: data.industry || "",
        location: data.location || "",
        websiteUrl: data.websiteUrl || "",
        description: data.description || "",
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveError(null);
      setSaved(false);
      await clientAPI.updateProfile(form);
      setSaved(true);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm";
  const labelClass = "block text-xs font-medium mb-1";
  const user = data?.userId;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Your business details, as CC and creators see them</p>
      </div>

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Unable to load profile</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          {saveError && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-500">{saveError}</div>}
          {saved && <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-sm text-green-500">Profile updated.</div>}

          {user && (
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
              <div>
                <label className={labelClass}>Name</label>
                <p className="text-sm text-muted-foreground py-2">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <p className="text-sm text-muted-foreground py-2">{user.email}</p>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Brand / Company Name</label>
            <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Industry</label>
              <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}
