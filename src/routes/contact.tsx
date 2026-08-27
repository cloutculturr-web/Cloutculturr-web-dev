import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { creators } from "@/data/site";

const title = "Book a Strategy Call — Cloutculturr";
const description =
  "Tell us about your brand and book a free strategy call with the Cloutculturr team, or get routed to a vetted marketplace creator.";

type Search = { intent?: "cc" | "creator" | undefined };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    intent: search["intent"] === "creator" ? "creator" : search["intent"] === "cc" ? "cc" : undefined,
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ContactPage,
});

const modes = ["Google Meet", "Zoom", "Phone Call", "Offline"];
const slots = ["10:00", "11:30", "14:00", "15:30", "17:00", "18:30"];

function ContactPage() {
  const { intent } = Route.useSearch();
  const [step, setStep] = useState(intent ? 1 : 0);
  const [withCC, setWithCC] = useState<boolean | null>(intent === "cc" ? true : intent === "creator" ? false : null);
  const [form, setForm] = useState({
    name: "", email: "", brand: "", budget: "₹25,000 – ₹50,000",
    mode: "Google Meet", date: "", time: "", creator: creators[0]!.id, message: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name || !form.email || !form.date || !form.time) {
      toast.error("Please complete your details, date and time.");
      return;
    }
    toast.success("Strategy call requested", {
      description: withCC
        ? `The CC team will confirm ${form.date} at ${form.time} via ${form.mode}.`
        : `We'll connect you with your selected creator for ${form.date} at ${form.time}.`,
    });
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="relative overflow-hidden px-6 pb-24 pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-80" style={{ background: "var(--gradient-veil)" }} />
        <div className="relative mx-auto max-w-3xl">
          {/* Company Info Banner */}
          <Reveal className="mb-12">
            <div className="glass grain rounded-[2rem] p-8 sm:p-10">
              <div className="grid gap-8 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
                  <a href="mailto:cloutculturr@gmail.com" className="mt-2 text-sm font-semibold text-accent hover:underline">
                    cloutculturr@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phone</p>
                  <a href="tel:+919704924121" className="mt-2 text-sm font-semibold text-accent hover:underline">
                    +91 9704924121
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Location</p>
                  <p className="mt-2 text-sm font-semibold">Hyderabad, India</p>
                </div>
              </div>
            </div>
          </Reveal>
          
          <Reveal>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Book a call</span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.03] sm:text-6xl">
              Let's map your <span className="text-gradient">growth</span>.
            </h1>
            <p className="mt-5 text-sm text-muted-foreground sm:text-base">
              Every enquiry reaches the Cloutculturr team first. If we're not the right fit, we route
              you into the vetted creator marketplace.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-12">
            <div className="glass grain relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
              <div className="mb-8 flex gap-2">
                {[0, 1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-brand-gradient" : "bg-secondary"}`}
                  />
                ))}
              </div>

              {step === 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold">Do you want to work with Cloutculturr?</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    CC handles your project end-to-end as the flagship agency. Prefer someone else?
                    We'll open the marketplace instead.
                  </p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => { setWithCC(true); setStep(1); }}
                      className="rounded-2xl bg-brand-gradient p-6 text-left text-primary-foreground transition-transform hover:scale-[1.02]"
                    >
                      <CalendarCheck className="size-5" />
                      <div className="mt-4 text-lg font-semibold">Yes — work with CC</div>
                      <p className="mt-2 text-xs opacity-80">Our in-house team takes the project.</p>
                    </button>
                    <button
                      onClick={() => { setWithCC(false); setStep(1); }}
                      className="rounded-2xl border border-border p-6 text-left transition-colors hover:bg-secondary"
                    >
                      <Users className="size-5 text-primary" />
                      <div className="mt-4 text-lg font-semibold">No — show me creators</div>
                      <p className="mt-2 text-xs text-muted-foreground">Enter the vetted marketplace.</p>
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-5">
                  <h2 className="text-2xl font-semibold">Tell us about your brand</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" value={form.name} onChange={(v) => set("name", v)} />
                    <Field label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" />
                    <Field label="Brand / business" value={form.brand} onChange={(v) => set("brand", v)} />
                    <Select
                      label="Monthly budget"
                      value={form.budget}
                      onChange={(v) => set("budget", v)}
                      options={["Under ₹25,000", "₹25,000 – ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000+"]}
                    />
                  </div>
                  {withCC === false ? (
                    <Select
                      label="Preferred creator"
                      value={form.creator}
                      onChange={(v) => set("creator", v)}
                      options={creators.map((c) => c.id)}
                      labels={creators.map((c) => `${c.name} — ${c.role}`)}
                    />
                  ) : null}
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What do you need?</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      rows={4}
                      className="mt-2 w-full rounded-2xl bg-secondary/60 px-4 py-3 text-sm outline-none ring-primary/50 focus:ring-2"
                    />
                  </div>
                  <Nav2 onBack={() => setStep(0)} onNext={() => setStep(2)} />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Pick a slot</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date" value={form.date} onChange={(v) => set("date", v)} type="date" />
                    <Select label="Meeting mode" value={form.mode} onChange={(v) => set("mode", v)} options={modes} />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Time</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {slots.map((s) => (
                        <button
                          key={s}
                          onClick={() => set("time", s)}
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                            form.time === s ? "border-primary bg-secondary" : "border-border text-muted-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Nav2 onBack={() => setStep(1)} onNext={submit} nextLabel="Confirm booking" />
                </div>
              ) : null}

              {step === 3 ? (
                <div className="py-6 text-center">
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-gradient text-primary-foreground">
                    <CalendarCheck className="size-6" />
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold">You're booked.</h2>
                  <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
                    {withCC
                      ? "The Cloutculturr team will send a confirmation and calendar invite shortly."
                      : "We'll introduce you to your selected creator and share the meeting invite."}
                  </p>
                  <p className="mt-6 text-sm">
                    {form.date} • {form.time} • {form.mode}
                  </p>
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Nav2({ onBack, onNext, nextLabel = "Continue" }: { onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="flex justify-between gap-3 pt-2">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back
      </button>
      <button onClick={onNext} className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">
        {nextLabel} <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl bg-secondary/60 px-4 py-3 text-sm outline-none ring-primary/50 focus:ring-2"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (v: string) => void; options: string[]; labels?: string[] }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl bg-secondary/60 px-4 py-3 text-sm outline-none ring-primary/50 focus:ring-2"
      >
        {options.map((o, i) => (
          <option key={o} value={o} className="bg-card">
            {labels?.[i] ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}