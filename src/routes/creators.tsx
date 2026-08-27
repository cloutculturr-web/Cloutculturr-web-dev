import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Lock, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { creators, type Creator } from "@/data/site";

const title = "Creator Marketplace — CloutCulturee";
const description =
  "Browse, compare and hire CC-approved editors, photographers, designers and performance marketers with transparent packages and pricing.";

export const Route = createFileRoute("/creators")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CreatorsPage,
});

const niches = ["All", "Restaurants", "Startups", "Personal Brands", "Small Business", "Influencers", "Agencies"];

function CreatorsPage() {
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState("All");
  const [premium, setPremium] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return creators.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q || [c.name, c.role, c.city, ...c.niche].join(" ").toLowerCase().includes(q);
      const matchesN = niche === "All" || c.niche.some((n) => n.toLowerCase().includes(niche.toLowerCase()));
      return matchesQ && matchesN;
    });
  }, [query, niche]);

  const toggleCompare = (id: string) => {
    if (!premium) {
      toast.error("Comparisons are a Premium feature", {
        description: "Upgrade to Premium (₹100/month) to compare creators.",
      });
      return;
    }
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  };

  const compared = creators.filter((c) => compare.includes(c.id));

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <section className="relative overflow-hidden px-6 pb-16 pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-80" style={{ background: "var(--gradient-veil)" }} />
        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Marketplace</span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] sm:text-7xl">
              Vetted creators.<br />
              <span className="text-gradient">Transparent pricing.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm text-muted-foreground sm:text-base">
              Every creator here was invited and approved by the CloutCulturee team. Nobody
              self-registers. Compare packages, then book directly.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <div className="glass flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-secondary/60 px-4 py-3">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, skill or city"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={() => {
                  setPremium((p) => !p);
                  toast.success(premium ? "Switched to Free preview" : "Premium unlocked (demo)");
                }}
                className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.03] ${
                  premium ? "bg-brand-gradient text-primary-foreground" : "border border-border"
                }`}
              >
                {premium ? "Premium active" : "Preview Premium"}
              </button>
            </div>
          </Reveal>

          <div className="mt-6 flex flex-wrap gap-2">
            {niches.map((n) => (
              <button
                key={n}
                onClick={() => setNiche(n)}
                className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                  niche === n
                    ? "border-primary bg-secondary text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <CreatorCard
                creator={c}
                premium={premium}
                selected={compare.includes(c.id)}
                onCompare={() => toggleCompare(c.id)}
              />
            </Reveal>
          ))}
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No creators match that search yet.</p>
          ) : null}
        </div>

        {compared.length > 1 ? (
          <div className="mx-auto mt-16 max-w-6xl">
            <h2 className="text-2xl font-semibold">Comparison</h2>
            <div className="glass mt-6 overflow-x-auto rounded-3xl p-6">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="pb-4 font-normal">Creator</th>
                    <th className="pb-4 font-normal">Rating</th>
                    <th className="pb-4 font-normal">Experience</th>
                    <th className="pb-4 font-normal">Basic</th>
                    <th className="pb-4 font-normal">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {compared.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-4 font-medium">{c.name}</td>
                      <td className="py-4">{c.rating} ({c.reviews})</td>
                      <td className="py-4">{c.years} yrs</td>
                      <td className="py-4">₹{c.packages[0]!.price.toLocaleString("en-IN")}</td>
                      <td className="py-4">₹{c.packages[2]!.price.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {!premium ? (
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="glass neon-ring flex flex-col items-center gap-4 rounded-3xl p-10 text-center">
              <Lock className="size-6 text-primary" />
              <h3 className="text-2xl font-semibold">You're on the Free plan</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Free accounts can browse up to 10 creators. Premium (₹100/month) unlocks messaging,
                bookings, comparisons, downloads and AI recommendations.
              </p>
              <Link to="/pricing" className="mt-2 rounded-full bg-brand-gradient px-7 py-3 text-sm font-semibold text-primary-foreground">
                Go Premium
              </Link>
            </div>
          </div>
        ) : null}
      </section>
      <Footer />
    </div>
  );
}

function CreatorCard({
  creator: c,
  premium,
  selected,
  onCompare,
}: {
  creator: Creator;
  premium: boolean;
  selected: boolean;
  onCompare: () => void;
}) {
  const [pkg, setPkg] = useState(0);
  const active = c.packages[pkg] ?? c.packages[0]!;

  return (
    <article className={`glass h-full overflow-hidden rounded-[2rem] p-2 transition-all duration-500 hover:-translate-y-1.5 ${selected ? "neon-ring" : ""}`}>
      <div className={`relative grid h-36 place-items-center rounded-[1.6rem] bg-gradient-to-br ${c.hue}`}>
        <span className="text-4xl font-bold text-primary-foreground/90">{c.name[0]}</span>
        <span className="absolute bottom-3 right-3 rounded-full bg-background/70 px-3 py-1 text-[11px] backdrop-blur">
          {c.city}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{c.name}</h3>
            <p className="truncate text-sm text-primary">{c.role}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm">
            <Star className="size-3.5 fill-primary text-primary" /> {c.rating}
            <span className="text-muted-foreground">({c.reviews})</span>
          </span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{c.bio}</p>

        <div className="mt-5 flex gap-1.5">
          {c.packages.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setPkg(i)}
              className={`flex-1 rounded-xl border px-2 py-2 text-xs transition-colors ${
                pkg === i ? "border-primary bg-secondary" : "border-border text-muted-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-secondary/50 p-5">
          <div className="text-2xl font-bold">₹{active.price.toLocaleString("en-IN")}</div>
          <ul className="mt-3 space-y-2">
            {active.deliverables.map((d) => (
              <li key={d} className="flex gap-2 text-xs text-muted-foreground">
                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" /> {d}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {active.delivery} • {active.revisions} revisions
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            to="/contact"
            search={{ intent: "creator" }}
            className="flex-1 rounded-full bg-brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
          >
            {premium ? "Hire creator" : "Enquire"}
          </Link>
          <button
            onClick={onCompare}
            className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
              selected ? "border-primary text-foreground" : "border-border text-muted-foreground"
            }`}
          >
            {selected ? "Added" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}