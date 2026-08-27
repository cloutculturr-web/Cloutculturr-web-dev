import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Check, Sparkles, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { FloatingBackground } from "@/components/site/FloatingBackground";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { FounderProfile } from "@/components/site/FounderProfile";
import {
  agencyPackages,
  caseStudies,
  creators,
  faqs,
  services,
  stats,
  testimonials,
  workflow,
} from "@/data/site";

const title = "Cloutculturr — Scaling Potential • Empowering Brands";
const description =
  "Cloutculturr is a premium digital marketing agency and vetted creator marketplace helping restaurants, startups and personal brands dominate social media.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Marquee />
      <Story />
      <FounderProfile />
      <Services />
      <Workflow />
      <CaseStudies />
      <Packages />
      <WhyUs />
      <Testimonials />
      <Marketplace />
      <Membership />
      <Faq />
      <Contact />
      <Footer />
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <section ref={ref} className="relative grain flex min-h-screen items-center overflow-hidden px-6 pt-32">
      <FloatingBackground />
      <motion.div style={{ y, opacity, scale }} className="relative mx-auto w-full max-w-5xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground backdrop-blur"
        >
          <Sparkles className="size-3.5 text-primary" /> Agency + Creator Marketplace
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mt-8 text-[clamp(2.2rem,8.2vw,7rem)] font-bold tracking-[-0.04em] leading-[0.92] text-gradient"
        >
          CLOUTCULTURR
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-6 text-lg font-medium tracking-[0.12em] text-foreground sm:text-2xl"
        >
          Scaling Potential. Empowering Brands.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground sm:text-base"
        >
          Helping brands dominate social media through creativity, strategy and technology.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
          >
            Book a Strategy Call
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/creators"
            className="glass rounded-full px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Explore Creators
          </Link>
          <Link
            to="/creator-apply"
            className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Become a Creator
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Restaurants", "Startups", "Personal Brands", "Influencers", "Small Business",
    "Content Creators", "Agencies", "D2C",
  ];
  return (
    <div className="relative overflow-hidden border-y border-border py-5">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {t} <span className="ml-10 text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Story() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Our Story"
          align="left"
          title={<>We built the agency<br />we wished existed.</>}
          subtitle="Cloutculturr started with three people, one camera and a belief that great brands lose to average marketing every day. Today we run growth for restaurants, startups and creators — and we opened our vetted creator network so no brand has to gamble on talent again."
        />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="glass grain relative h-full overflow-hidden rounded-3xl p-8">
                <div className="text-4xl font-bold text-gradient sm:text-5xl">{s.value}</div>
                <div className="mt-3 text-sm text-muted-foreground">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading
        eyebrow="Services"
        title={<>Everything a modern brand needs</>}
        subtitle="One team for content, paid, design and analytics — no vendor juggling."
      />
      <div className="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <div className="glass group relative h-full overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:neon-ring">
              <span className="text-xs uppercase tracking-[0.3em] text-primary">{s.tag}</span>
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
              <ArrowRight className="mt-8 size-5 text-muted-foreground transition-all duration-500 group-hover:translate-x-2 group-hover:text-primary" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading eyebrow="Workflow" title={<>How we scale you</>} />
      <div className="mx-auto mt-16 max-w-4xl">
        {workflow.map((w, i) => (
          <Reveal key={w.step} delay={i * 0.07}>
            <div className="group flex items-start gap-6 border-b border-border py-8 transition-colors hover:border-primary">
              <span className="w-12 shrink-0 text-sm text-muted-foreground">0{i + 1}</span>
              <div className="min-w-0">
                <h3 className="text-2xl font-semibold transition-colors group-hover:text-gradient sm:text-3xl">{w.step}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CaseStudies() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading eyebrow="Case Studies" title={<>Numbers, not adjectives</>} />
      <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:grid-cols-2">
        {caseStudies.map((c, i) => (
          <Reveal key={c.brand} delay={i * 0.08}>
            <div className="glass grain relative h-full overflow-hidden rounded-3xl p-10">
              <div className="absolute -right-10 -top-10 size-40 rounded-full opacity-40 blur-3xl" style={{ background: "var(--gradient-brand)" }} />
              <span className="relative text-xs uppercase tracking-[0.28em] text-muted-foreground">{c.type}</span>
              <div className="relative mt-6 text-5xl font-bold text-gradient sm:text-6xl">{c.metric}</div>
              <p className="relative mt-3 text-sm text-muted-foreground">{c.label}</p>
              <p className="relative mt-6 text-lg font-semibold">{c.brand}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading
        eyebrow="Packages"
        title={<>Work with <span className="text-gradient">CC</span> directly</>}
        subtitle="Flagship retainers delivered by the Cloutculturr in-house team."
      />
      <div className="mx-auto mt-16 grid max-w-6xl gap-5 lg:grid-cols-3">
        {agencyPackages.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.09}>
            <div className={`glass relative h-full overflow-hidden rounded-[2rem] p-8 ${p.highlight ? "neon-ring" : ""}`}>
              {p.highlight ? (
                <span className="absolute right-6 top-6 rounded-full bg-brand-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
                  Most chosen
                </span>
              ) : null}
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <div className="mt-8 flex items-end gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="pb-1.5 text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`mt-9 block rounded-full px-6 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.03] ${
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
  );
}

function WhyUs() {
  const reasons = [
    "CC gets the first shot at every project — you always talk to the flagship team first.",
    "Vetted-only marketplace: creators are invited and approved, never self-registered.",
    "Transparent commission and GST-ready invoicing on every marketplace booking.",
    "Content, paid and design under one roof, on one calendar, with one report.",
    "AI recommendations that match your budget and niche to the right creator.",
    "Dashboards you can actually read — revenue, not vanity reach.",
  ];
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Why Choose Us" align="left" title={<>Built like a product,<br />run like a studio.</>} />
        <div className="mt-14 grid gap-3 md:grid-cols-2">
          {reasons.map((r, i) => (
            <Reveal key={r} delay={i * 0.06}>
              <div className="glass flex items-start gap-4 rounded-2xl p-6">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-gradient text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground">{r}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading eyebrow="Testimonials" title={<>Loved by the brands we scale</>} />
      <div className="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.07}>
            <figure className="glass h-full rounded-3xl p-8">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mt-6 text-lg leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-6 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{t.name}</span> — {t.role}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Marketplace() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading
        eyebrow="Creator Marketplace"
        title={<>Hire vetted creators<br /> in <span className="text-gradient">48 hours</span></>}
        subtitle="Editors, photographers, designers, strategists and performance marketers — approved by CC, priced transparently."
      />
      <div className="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-3">
        {creators.slice(0, 3).map((c, i) => (
          <Reveal key={c.id} delay={i * 0.08}>
            <div className="glass h-full overflow-hidden rounded-[2rem] p-2 transition-transform duration-500 hover:-translate-y-2">
              <div className={`grid h-40 place-items-center rounded-[1.6rem] bg-gradient-to-br ${c.hue}`}>
                <span className="text-4xl font-bold text-primary-foreground/90">{c.name[0]}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-lg font-semibold">{c.name}</h3>
                  <span className="flex shrink-0 items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-primary text-primary" /> {c.rating}
                  </span>
                </div>
                <p className="mt-1 text-sm text-primary">{c.role}</p>
                <p className="mt-4 text-sm text-muted-foreground">{c.bio}</p>
                <p className="mt-5 text-sm">
                  From <span className="font-semibold">₹{c.from.toLocaleString("en-IN")}</span>
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2} className="mt-12 text-center">
        <Link
          to="/creators"
          className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
        >
          Explore the marketplace <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </section>
  );
}

function Membership() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading eyebrow="Membership" title={<>Browse free. Go Premium to hire.</>} />
      <div className="mx-auto mt-16 grid max-w-4xl gap-5 md:grid-cols-2">
        <Reveal>
          <div className="glass h-full rounded-[2rem] p-8">
            <h3 className="text-xl font-semibold">Free</h3>
            <div className="mt-6 text-4xl font-bold">₹0</div>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {["Browse up to 10 creators", "View public portfolios", "No direct contact", "No comparisons", "No downloads"].map((f) => (
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
              {["Unlimited creator access & search", "Unlimited comparisons", "Direct messaging & bookings", "Shortlists and saved creators", "AI creator recommendations", "Priority support"].map((f) => (
                <li key={f} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{f}</li>
              ))}
            </ul>
            <Link to="/pricing" className="mt-9 block rounded-full bg-brand-gradient px-6 py-3 text-center text-sm font-semibold text-primary-foreground">
              Go Premium
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading eyebrow="FAQs" title={<>Questions, answered</>} />
      <Reveal className="mx-auto mt-14 max-w-3xl">
        <Accordion type="single" collapsible className="glass rounded-3xl px-6">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-border">
              <AccordionTrigger className="py-6 text-left text-base font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}

function Contact() {
  return (
    <section className="relative px-6 py-28">
      <Reveal className="glass grain relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] p-12 text-center sm:p-20">
        <div className="absolute inset-x-0 -top-24 h-64 opacity-70" style={{ background: "var(--gradient-veil)" }} />
        <h2 className="relative text-4xl font-semibold leading-tight sm:text-6xl">
          Let's scale your <span className="text-gradient">potential</span>.
        </h2>
        <p className="relative mx-auto mt-5 max-w-lg text-sm text-muted-foreground sm:text-base">
          Book a free strategy call. We'll audit your brand, show you what's leaking, and hand you a
          plan — whether you work with CC or a marketplace creator.
        </p>
        <div className="relative mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/contact" className="rounded-full bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04]">
            Book a Strategy Call
          </Link>
          <Link to="/creators" className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary">
            Browse Creators
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
