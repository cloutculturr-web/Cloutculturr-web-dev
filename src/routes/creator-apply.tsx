import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Image as ImageIcon,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCircle,
  Wallet,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { FloatingBackground } from "@/components/site/FloatingBackground";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { creatorApplicationAPI } from "@/services/api";

const title = "Become a Creator - Cloutculturr";
const description = "Apply to join the Cloutculturr creator network — see the process, what you get, and how commission works before you apply.";

export const Route = createFileRoute("/creator-apply")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
    ],
  }),
  component: CreatorApplyPage,
});

function CreatorApplyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <CreatorHero />
      <HowItWorks />
      <WhatYouGet />
      <Commission />
      <YourData />
      <ApplyForm />
      <Footer />
    </div>
  );
}

function CreatorHero() {
  return (
    <section className="relative grain flex min-h-[85vh] items-center overflow-hidden px-6 pt-32">
      <FloatingBackground />
      <div className="relative mx-auto w-full max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-primary" /> Creator Network
        </span>
        <h1 className="mt-8 text-[clamp(2rem,6.5vw,5rem)] font-bold tracking-[-0.03em] leading-[0.98] text-gradient">
          Become a Cloutculturr Creator
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          Join a vetted network where CC brings the client and the project — you focus on delivering great work
          and get paid on a transparent commission, tracked in your own dashboard.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#apply-form"
            className="group inline-flex items-center gap-2 rounded-full bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
          >
            Apply as Creator
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#how-it-works"
            className="glass rounded-full px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    step: "Submit your application",
    desc: "Tell us who you are — your bio, location, experience, skills, socials, and portfolio links or samples. Takes a few minutes.",
  },
  {
    step: "CC reviews it manually",
    desc: "Every application is read by the CC team — nothing is auto-approved and nothing is auto-rejected.",
  },
  {
    step: "You're assigned a tier and pricing",
    desc: "If approved, CC places you in a tier and sets your approved pricing, based on your experience and portfolio.",
  },
  {
    step: "You get your Creator Dashboard",
    desc: "Log in to manage your profile, portfolio and service packages, see projects CC assigns you, and track real earnings.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-28">
      <SectionHeading eyebrow="Process" title={<>How it works</>} />
      <div className="mx-auto mt-16 max-w-4xl">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={i * 0.07}>
            <div className="group flex items-start gap-6 border-b border-border py-8 transition-colors hover:border-primary">
              <span className="w-12 shrink-0 text-sm text-muted-foreground">0{i + 1}</span>
              <div className="min-w-0">
                <h3 className="text-2xl font-semibold transition-colors group-hover:text-gradient sm:text-3xl">{s.step}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const features = [
  {
    icon: UserCircle,
    title: "Profile you control",
    desc: "Bio, skills, languages, experience and social links — editable any time. CC-set fields like tier and pricing stay visible but read-only.",
  },
  {
    icon: ImageIcon,
    title: "Portfolio",
    desc: "Add case studies with client context, challenge, solution and results. Every item goes through review before it's marked approved.",
  },
  {
    icon: Package,
    title: "Your own service packages",
    desc: "Define what you offer — deliverables, timeline and price — and edit or retire packages whenever you want.",
  },
  {
    icon: Briefcase,
    title: "Project workspace",
    desc: "See exactly which projects CC has assigned you and their status, from active through completed.",
  },
  {
    icon: Wallet,
    title: "Real earnings, not estimates",
    desc: "Every payment shows the gross amount, CC's commission and your exact share — paid and pending, side by side.",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Approvals, tier changes and project updates land in your dashboard as they happen.",
  },
];

function WhatYouGet() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="What you get" title={<>Your own creator dashboard</>} subtitle="Everything below is real, working functionality — not a preview." />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="glass h-full rounded-2xl p-6">
                <div className="grid size-11 place-items-center rounded-xl bg-brand-gradient/15 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border p-5 text-sm text-muted-foreground">
            <TrendingUp className="mt-0.5 size-5 shrink-0 text-primary" />
            <p>
              Tiers, verification status and approved pricing are set by the CC team, not self-editable — that's what
              keeps a "verified creator" badge meaning something to clients.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Commission() {
  return (
    <section className="relative px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="glass grain relative overflow-hidden rounded-[2rem] p-10">
            <h3 className="text-2xl font-semibold">Commission &amp; payouts</h3>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary/50 p-6">
                <div className="text-4xl font-bold text-gradient">25–30%</div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Platform commission on marketplace bookings, configurable by admin. The remainder is your payout —
                  no hidden cuts.
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-6">
                <div className="text-4xl font-bold text-gradient">100%</div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Visible in your dashboard — every payment shows the gross amount, CC's exact commission and your
                  exact share, plus what's already paid vs. still pending.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function YourData() {
  return (
    <section className="relative px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="flex items-start gap-4 rounded-2xl border border-border p-6">
            <ShieldCheck className="mt-0.5 size-6 shrink-0 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Your data</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                What you submit below — your contact details, bio, portfolio links or files, and proposed pricing —
                is used only to review your application and, if approved, set up your creator profile. Your tier,
                verification status and approved pricing are set by the CC team and shown to you exactly as
                recorded; nothing about your account is fabricated or estimated on your behalf.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

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

function ApplyForm() {
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

  const inputClass =
    "w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none";
  const labelClass = "block text-sm font-medium mb-2";

  if (submitted) {
    return (
      <section id="apply-form" className="relative px-6 py-28">
        <div className="mx-auto w-full max-w-md text-center glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gradient mb-3">Application received</h2>
          <p className="text-muted-foreground mb-6">
            Thanks for applying to Cloutculturr. Our team reviews every application manually — we'll reach out to
            the email you provided once a decision is made.
          </p>
          <Link to="/" className="text-primary hover:underline text-sm">
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="apply-form" className="relative px-6 py-28">
      <div className="mx-auto w-full max-w-2xl">
        <SectionHeading eyebrow="Apply" title={<>Tell us about you</>} subtitle="CC's team reviews every application and assigns a tier and pricing before you go live." />

        <form onSubmit={handleSubmit} className="glass mt-14 rounded-2xl p-8 space-y-6">
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
    </section>
  );
}
