import { TreePine } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { barlow, barlowCondensed } from "./fonts";
import { LEGAL } from "./legal";

/* Styles partagés par les pages publiques (vitrine, guides, pages légales). */
export const container = "mx-auto w-full max-w-[1200px] px-6";
export const ctaBlaze =
  "inline-flex items-center gap-2.5 rounded-xl bg-blaze font-bold text-foreground transition-colors hover:bg-blaze-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Ancres de la page d'accueil (préfixées de « / » pour fonctionner partout). */
const NAV = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/guide", label: "Guide" },
  { href: "/#hors-ligne", label: "Hors réseau" },
  { href: "/#faq", label: "FAQ" },
];

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center bg-primary text-primary-foreground",
        small ? "size-[30px] rounded-lg" : "size-[38px] rounded-[10px]",
      )}
    >
      <TreePine
        className={small ? "size-[18px]" : "size-[22px]"}
        aria-hidden="true"
      />
    </span>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mb-3 text-sm font-bold tracking-[0.12em] text-primary uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
      <nav
        className={cn(
          container,
          "flex flex-wrap items-center justify-between gap-6 py-3.5",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-2xl font-bold">
            Cahier de battue
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-base font-medium md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-primary">
              {n.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/connexion"
            className="inline-flex min-h-11 items-center px-3.5 font-semibold hover:text-primary"
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className={cn(ctaBlaze, "min-h-11 rounded-[10px] px-[18px]")}
          >
            Créer mon cahier
          </Link>
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div
        className={cn(
          container,
          "flex flex-col gap-6 py-10 text-[15px] text-ink-muted",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <Logo small />
            <span className="font-semibold text-foreground">
              Cahier de battue
            </span>
            <span>· © {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/guide" className="hover:text-foreground">
              Guide
            </Link>
            <Link href="/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-foreground">
              Confidentialité
            </Link>
            <a href={`mailto:${LEGAL.email}`} className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
        <p className="max-w-[760px] text-sm">
          Cahier de battue est le carnet de battue et le carnet de chasse en
          ligne des sociétés de chasse et ACCA : pointage signé, tableau de
          chasse, partage du gibier et cotisations, gratuitement et même sans
          réseau.
        </p>
      </div>
    </footer>
  );
}

/** Cadre des pages publiques : typo vitrine, en-tête et pied de page. */
export function VitrineShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        barlow.variable,
        barlowCondensed.variable,
        "vitrine flex-1 bg-background font-vitrine text-[17px] leading-[1.55] text-foreground",
      )}
    >
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
