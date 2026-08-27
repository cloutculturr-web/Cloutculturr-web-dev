import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useCreatorProfile } from "@/hooks/useCreatorAPI";
import { creatorAPI } from "@/services/api";

export const Route = createFileRoute("/creator/profile/")({
  component: CreatorProfile,
});

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function CreatorProfile() {
  const { data: profile, loading, error, refetch } = useCreatorProfile();

  const [form, setForm] = useState({
    companyName: "",
    bio: "",
    profilePhoto: "",
    location: "",
    experience: 0,
    languages: "",
    skills: "",
    website: "",
    instagram: "",
    linkedin: "",
    twitter: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.companyName || "",
        bio: profile.bio || "",
        profilePhoto: profile.profilePhoto || "",
        location: profile.location || "",
        experience: profile.experience || 0,
        languages: (profile.languages || []).join(", "),
        skills: (profile.skills || []).join(", "),
        website: profile.website || "",
        instagram: profile.socialMedia?.instagram || "",
        linkedin: profile.socialMedia?.linkedin || "",
        twitter: profile.socialMedia?.twitter || "",
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      await creatorAPI.updateProfile({
        companyName: form.companyName,
        bio: form.bio,
        profilePhoto: form.profilePhoto || undefined,
        location: form.location,
        experience: Number(form.experience),
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        website: form.website || undefined,
        socialMedia: { instagram: form.instagram, linkedin: form.linkedin, twitter: form.twitter },
      });
      setSaveSuccess(true);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityChange = async (value: "available" | "busy" | "unavailable") => {
    try {
      setAvailabilitySaving(true);
      setAvailabilityError(null);
      await creatorAPI.updateAvailability(value);
      refetch();
    } catch (err) {
      setAvailabilityError(err instanceof Error ? err.message : "Failed to update availability");
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2 bg-background border border-border rounded-lg text-sm";
  const labelClass = "block text-sm font-medium mb-2";

  if (loading && !profile) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-500">Unable to load profile</p>
          <p className="text-sm text-red-500/80">{error}</p>
        </div>
        <button onClick={() => refetch()} className="ml-auto px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg text-sm hover:bg-red-500/30">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Editable details, plus what CC controls on your behalf</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Editable Details</h2>

          {saveSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 mb-4 text-sm text-green-500">Profile saved.</div>
          )}
          {saveError && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 text-sm text-red-500">{saveError}</div>}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Brand / Company Name</label>
                <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} maxLength={1000} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Profile Photo URL</label>
              <input value={form.profilePhoto} onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })} placeholder="https://" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Languages</label>
                <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="English, Hindi" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Skills</label>
                <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Reels, Photography" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Instagram</label>
                <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>LinkedIn</label>
                <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Twitter / X</label>
                <input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">Availability</h2>
            {availabilityError && <p className="text-sm text-red-500 mb-2">{availabilityError}</p>}
            <div className="flex flex-col gap-2">
              {(["available", "busy", "unavailable"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => handleAvailabilityChange(v)}
                  disabled={availabilitySaving}
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors disabled:opacity-50 ${
                    profile.availability === v ? "bg-primary text-primary-foreground" : "bg-background border border-border hover:bg-card"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3">CC-Controlled</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Tier</p>
                <p className="mt-1">{profile.tierId?.name || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Verification</p>
                <p className="mt-1 capitalize">{profile.verification?.status || "pending"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Approved Pricing</p>
                <p className="mt-1">{formatCurrency(profile.pricing?.approvedAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Proposed Pricing</p>
                <p className="mt-1">{formatCurrency(profile.pricing?.proposedAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Pricing Status</p>
                <p className="mt-1 capitalize">{profile.pricing?.status || "pending"}</p>
              </div>
            </div>

            {profile.pricingHistory && profile.pricingHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase mb-2">Pricing History</p>
                <div className="space-y-2">
                  {profile.pricingHistory
                    .slice()
                    .reverse()
                    .map((entry: any, idx: number) => (
                      <div key={idx} className="text-xs text-muted-foreground">
                        {entry.previousAmount != null ? `${formatCurrency(entry.previousAmount)} → ` : ""}
                        {formatCurrency(entry.newAmount)} — {entry.reason}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
