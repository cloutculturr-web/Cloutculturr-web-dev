import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { creatorApplicationAPI } from "@/services/api";

export const Route = createFileRoute("/creator-apply")({
  head: () => ({
    meta: [
      { title: "Apply as a Creator - CloutCulturee" },
      { name: "description", content: "Apply to join the CloutCulturee creator network" },
    ],
  }),
  component: CreatorApplyPage,
});

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  companyName: string;
  bio: string;
  location: string;
  experience: string;
  languages: string;
  skills: string;
  website: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  portfolioLinks: string;
  proposedPricing: string;
  pricingNotes: string;
}

const initialState: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  companyName: "",
  bio: "",
  location: "",
  experience: "",
  languages: "",
  skills: "",
  website: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  portfolioLinks: "",
  proposedPricing: "",
  pricingNotes: "",
};

function CreatorApplyPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []).slice(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      if (form.phoneNumber) formData.append("phoneNumber", form.phoneNumber);
      formData.append("companyName", form.companyName);
      formData.append("bio", form.bio);
      formData.append("location", form.location);
      if (form.experience) formData.append("experience", form.experience);
      if (form.languages) formData.append("languages", form.languages);
      if (form.skills) formData.append("skills", form.skills);
      if (form.website) formData.append("website", form.website);
      if (form.instagram) formData.append("instagram", form.instagram);
      if (form.linkedin) formData.append("linkedin", form.linkedin);
      if (form.twitter) formData.append("twitter", form.twitter);
      if (form.portfolioLinks) formData.append("portfolioLinks", form.portfolioLinks);
      if (form.proposedPricing) formData.append("proposedPricing", form.proposedPricing);
      if (form.pricingNotes) formData.append("pricingNotes", form.pricingNotes);
      files.forEach((file) => formData.append("portfolioFiles", file));

      await creatorApplicationAPI.submit(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gradient mb-3">Application received</h1>
          <p className="text-muted-foreground mb-6">
            Thanks for applying to CloutCulturee. Our team reviews every application manually —
            we'll reach out to the email you provided once a decision is made.
          </p>
          <Link to="/" className="text-primary hover:underline text-sm">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none";
  const labelClass = "block text-sm font-medium mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gradient mb-2">Apply as a Creator</h1>
          <p className="text-muted-foreground">
            Tell us about you — CC's team reviews every application and assigns a tier and pricing before you go live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Brand / Company Name *</label>
              <input name="companyName" value={form.companyName} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Location *</label>
              <input name="location" value={form.location} onChange={handleChange} className={inputClass} required />
            </div>
          </div>

          <div>
            <label className={labelClass}>Bio *</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              minLength={20}
              maxLength={1000}
              placeholder="Tell us about your content, niche, and experience (20-1000 characters)"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Years of Experience</label>
              <input type="number" min={0} name="experience" value={form.experience} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input name="website" value={form.website} onChange={handleChange} placeholder="https://" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Languages</label>
              <input name="languages" value={form.languages} onChange={handleChange} placeholder="English, Hindi" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Skills</label>
              <input name="skills" value={form.skills} onChange={handleChange} placeholder="Reels, Photography, Editing" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Instagram</label>
              <input name="instagram" value={form.instagram} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input name="linkedin" value={form.linkedin} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Twitter / X</label>
              <input name="twitter" value={form.twitter} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Portfolio Links</label>
            <input
              name="portfolioLinks"
              value={form.portfolioLinks}
              onChange={handleChange}
              placeholder="Comma-separated links to your work"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Proposed Pricing (₹)</label>
              <input type="number" min={0} name="proposedPricing" value={form.proposedPricing} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Pricing Notes</label>
              <input name="pricingNotes" value={form.pricingNotes} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Portfolio Samples (up to 5 files — JPG, PNG, WEBP, or PDF, 10MB each)</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
            />
            {files.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{files.length} file(s) selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-gradient text-primary-foreground font-medium py-2.5 rounded-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
