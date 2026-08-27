import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { agencyPackages, faqs } from "@/data/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const title = "Pricing & Membership — CloutCulturee";
const description =
  "CloutCulturee agency retainers, marketplace commission structure and the ₹100/month Premium membership for unlimited creator access.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="relative overflow-hidden px-6 pb-10 pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-80" style={{ background: "var(--gradient-veil)" }} />
        <div className="relative">
          <SectionHeading
            eyebrow="Pricing"
            title={<>Simple pricing.<br /><span className="text-gradient">Serious outcomes.</span></>}
            subtitle="Work with the CC team directly, or hire from the marketplace on a Premium membership."
          />
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          {agencyPackages.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div className={`glass h-full rounded-[2rem] p-8 ${p.highlight ? "neon-ring" : ""}`}>
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <div className="mt-8 flex items-end gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="pb-1.5 text-sm text-muted-foreground">{p.period}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`mt-9 block rounded-full px-6 py-3 text-center text-sm font-semibold ${
                    p.highlight ? "bg-brand-gradient text-primary-foreground" : "border border-border"
                  }`}
                >
                  Choose {p.name}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <SectionHeading eyebrow="Membership" title={<>Marketplace access</>} />
        <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
          <Reveal>
            <div className="glass h-full rounded-[2rem] p-8">
              <h3 className="text-xl font-semibold">Free</h3>
              <div className="mt-6 text-4xl font-bold">₹0</div>
              <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                {["Browse up to 10 creators", "Public portfolios", "No direct contact", "No comparisons", "No portfolio downloads"].map((f) => (
                  <li key={f} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />{f}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass neon-ring h-full rounded-[2rem] p-8">
              <h3 className="text-xl font-semibold text-gradient">Premium</h3>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-4xl font-bold">₹100</span>
                <span className="pb-1.5 text-sm text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                {["Unlimited creator access", "Unlimited search & comparisons", "Messaging and bookings", "Shortlists & saved creators", "AI recommendations", "Priority support"].map((f) => (
                  <li key={f} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{f}</li>
                ))}
              </ul>
              <Link to="/contact" className="mt-9 block rounded-full bg-brand-gradient px-6 py-3 text-center text-sm font-semibold text-primary-foreground">
                Get Premium
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="glass grain relative overflow-hidden rounded-[2rem] p-10">
              <h3 className="text-2xl font-semibold">How revenue works</h3>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-secondary/50 p-6">
                  <div className="text-4xl font-bold text-gradient">100%</div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Projects delivered by the CloutCulturee team — full revenue stays with CC.
                  </p>
                </div>
                <div className="rounded-2xl bg-secondary/50 p-6">
                  <div className="text-4xl font-bold text-gradient">25–30%</div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Platform commission on marketplace bookings — configurable by admin. The
                    remainder is paid out to the creator.
                  </p>
                </div>
              </div>
              <p className="mt-8 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                UPI • Cards • Net Banking • Wallets • GST-ready invoices
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-16">
        <SectionHeading eyebrow="FAQs" title={<>Pricing questions</>} />
        <Reveal className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="glass rounded-3xl px-6">
            {faqs.slice(2).map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-border">
                <AccordionTrigger className="py-6 text-left text-base font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="pb-6 text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>
      <Footer />
    </div>
  );
}