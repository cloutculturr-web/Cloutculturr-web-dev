import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Instagram, Linkedin, Mail } from "lucide-react";
import { founders } from "@/data/site";
import { Reveal } from "./Reveal";

const COUNT = founders.length;

export function FounderProfile() {
  const [active, setActive] = useState(0);
  const founder = founders[active];

  const goTo = (index: number) => setActive(index);
  const goPrev = () => goTo((active - 1 + COUNT) % COUNT);
  const goNext = () => goTo((active + 1) % COUNT);

  return (
    <section className="relative overflow-hidden px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
            Founders
          </span>
          <h2 className="mt-6 text-4xl font-bold sm:text-5xl">
            Meet <span className="text-gradient">{founder.name}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{founder.title}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-16">
          <div className="relative overflow-hidden">
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="glass group overflow-hidden rounded-[2.5rem] p-2">
                  <div className="grid gap-8 overflow-hidden rounded-[2rem] md:grid-cols-[1fr_1.2fr]">
                    {/* Image / placeholder */}
                    <div className={`relative aspect-[3/4] w-full self-start overflow-hidden rounded-[2rem] bg-gradient-to-br ${founder.hue}`}>
                      {founder.image ? (
                        <img src={founder.image} alt={founder.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center">
                          <span className="text-7xl font-bold text-primary-foreground/90">{founder.shortName[0]}</span>
                        </div>
                      )}
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{
                          background: "radial-gradient(circle at 50% 100%, oklch(0 0 0 / 45%), transparent 70%)",
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center p-8">
                      <div>
                        <h3 className="text-3xl font-bold sm:text-4xl">{founder.name}</h3>
                        <p className="mt-2 text-lg font-semibold text-primary">{founder.title}</p>
                        <p className="mt-6 leading-relaxed text-muted-foreground">{founder.bio}</p>
                      </div>

                      <div className="mt-10 flex flex-col gap-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                          Connect with {founder.shortName}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {founder.socialMedia.instagram && (
                            <a
                              href={founder.socialMedia.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary hover:text-primary"
                              aria-label={`${founder.name}'s Instagram`}
                            >
                              <Instagram className="size-4" />
                              Instagram
                            </a>
                          )}
                          {founder.socialMedia.linkedin && (
                            <a
                              href={founder.socialMedia.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary hover:text-primary"
                              aria-label={`${founder.name}'s LinkedIn`}
                            >
                              <Linkedin className="size-4" />
                              LinkedIn
                            </a>
                          )}
                          {founder.socialMedia.email && (
                            <a
                              href={`mailto:${founder.socialMedia.email}`}
                              className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary hover:text-primary"
                              aria-label={`Email ${founder.name}`}
                            >
                              <Mail className="size-4" />
                              Email
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="mt-10 grid grid-cols-2 gap-4">
                        {founder.stats.map((s) => (
                          <div key={s.label} className="rounded-lg border border-border bg-secondary/30 p-4">
                            <p className="text-2xl font-bold text-gradient">{s.value}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              onClick={goPrev}
              aria-label="Previous founder"
              className="glass grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex gap-2">
              {founders.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => goTo(i)}
                  aria-label={`Show ${f.name}`}
                  className={`h-2 rounded-full transition-all ${i === active ? "w-8 bg-primary" : "w-2 bg-border"}`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              aria-label="Next founder"
              className="glass grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
