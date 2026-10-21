import { ArrowRight, ChevronRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { container, ctaBlaze, Eyebrow } from "./site-chrome";

/* Briques de mise en page des pages de contenu (guides, pages légales). */

export type Miette = { label: string; href?: string };

/** Fil d'Ariane visible + données structurées BreadcrumbList. */
function FilAriane({ miettes }: { miettes: Miette[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: miettes.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.label,
      ...(m.href ? { item: `${SITE_URL}${m.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-muted">
      <script
        type="application/ld+json"
        // Contenu statique (pas de saisie utilisateur).
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ol className="flex flex-wrap items-center gap-1.5">
        {miettes.map((m, i) => (
          <li key={m.label} className="inline-flex items-center gap-1.5">
            {i > 0 ? (
              <ChevronRight className="size-3.5" aria-hidden="true" />
            ) : null}
            {m.href ? (
              <Link href={m.href} className="hover:text-foreground">
                {m.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {m.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * En-tête + corps d'une page de contenu : en colonne de lecture par défaut,
 * ou sur toute la largeur du site (`large`) pour les listes en cartes.
 */
export function ContentPage({
  miettes,
  eyebrow,
  titre,
  intro,
  large = false,
  children,
}: {
  miettes: Miette[];
  eyebrow?: string;
  titre: string;
  intro?: React.ReactNode;
  large?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className={cn(container, !large && "max-w-[820px]", "py-14")}>
      <FilAriane miettes={miettes} />
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="font-display text-[clamp(38px,5vw,60px)] leading-[0.98] font-extrabold uppercase">
        {titre}
      </h1>
      {intro ? (
        <p className="mt-5 max-w-[760px] text-xl leading-normal text-ink-soft">
          {intro}
        </p>
      ) : null}
      <div className="mt-10 flex flex-col gap-10">{children}</div>
    </main>
  );
}

export function Section({
  titre,
  id,
  children,
}: {
  titre: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-4">
      <h2 className="font-display text-[clamp(26px,3vw,34px)] leading-tight font-extrabold uppercase">
        {titre}
      </h2>
      {children}
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-ink-soft">{children}</p>;
}

export function Liste({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-6 text-ink-soft marker:text-primary">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

/** Étapes numérotées. */
export function Etapes({
  items,
}: {
  items: { titre: string; texte: React.ReactNode }[];
}) {
  return (
    <ol className="flex flex-col gap-4">
      {items.map((e, i) => (
        <li key={e.titre} className="flex gap-4">
          <span className="flex size-9 flex-none items-center justify-center rounded-full bg-primary font-display text-lg font-extrabold text-primary-foreground">
            {i + 1}
          </span>
          <div className="flex flex-col gap-1 pt-1">
            <span className="font-bold">{e.titre}</span>
            <span className="text-ink-soft">{e.texte}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Encadré de conseil. */
export function Astuce({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border-2 border-primary bg-accent p-5 text-accent-foreground">
      <Lightbulb className="mt-0.5 size-5 flex-none" aria-hidden="true" />
      <div className="font-medium">{children}</div>
    </div>
  );
}

/** Lien interne dans le texte. */
export function A({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-semibold text-primary underline underline-offset-2 hover:text-foreground"
    >
      {children}
    </Link>
  );
}

/** Appel à l'inscription en fin de page. */
export function AppelInscription() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-[24px] bg-primary p-8 text-primary-foreground">
      <p className="font-display text-[clamp(28px,3.4vw,40px)] leading-none font-extrabold uppercase">
        Passez au cahier de battue numérique
      </p>
      <p className="text-primary-soft">
        Gratuit, sans carte bancaire, prêt pour votre prochaine battue.
      </p>
      <Link href="/inscription" className={cn(ctaBlaze, "min-h-12 px-6")}>
        Créer mon cahier gratuitement
        <ArrowRight className="size-5" aria-hidden="true" />
      </Link>
    </div>
  );
}
