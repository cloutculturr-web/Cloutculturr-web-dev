import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.svg";
import { companyInfo } from "@/data/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border px-6 py-16">
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 h-80 opacity-50"
        style={{ background: "var(--gradient-veil)" }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Cloutculturr" className="h-10 w-auto" />
          </div>
          <p className="mt-5 max-w-sm text-sm text-muted-foreground">
            Scaling potential businesses through strategic digital marketing — creativity, strategy
            and technology under one roof.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={companyInfo.socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-accent hover:border-accent"
              aria-label="Follow on Instagram"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href={companyInfo.socialMedia.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-accent hover:border-accent"
              aria-label="Connect on LinkedIn"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href={`mailto:${companyInfo.email}`}
              className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-accent hover:border-accent"
              aria-label="Send email"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Platform</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link to="/creators" className="text-muted-foreground transition-colors hover:text-accent">Creator Marketplace</Link></li>
            <li><Link to="/pricing" className="text-muted-foreground transition-colors hover:text-accent">Membership & Packages</Link></li>
            <li><Link to="/contact" className="text-muted-foreground transition-colors hover:text-accent">Book a Strategy Call</Link></li>
            <li><Link to="/creator-apply" className="text-muted-foreground transition-colors hover:text-accent">Apply as a Creator</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4 text-accent" />
              <a href={`mailto:${companyInfo.email}`} className="hover:text-accent transition-colors">
                {companyInfo.email}
              </a>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 text-accent" />
              <a href={`tel:${companyInfo.phone}`} className="hover:text-accent transition-colors">
                {companyInfo.phone}
              </a>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4 text-accent" />
              <span>{companyInfo.location}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} {companyInfo.name}. All rights reserved.</span>
        <span>{companyInfo.tagline}</span>
      </div>
    </footer>
  );
}