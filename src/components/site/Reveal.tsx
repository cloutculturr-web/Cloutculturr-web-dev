import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  blur?: boolean;
};

export function Reveal({ children, delay = 0, y = 34, className, blur = true }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(14px)" : "none" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        {eyebrow}
      </span>
      <h2 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">{title}</h2>
      {subtitle ? <p className="mt-5 text-base text-muted-foreground sm:text-lg">{subtitle}</p> : null}
    </Reveal>
  );
}