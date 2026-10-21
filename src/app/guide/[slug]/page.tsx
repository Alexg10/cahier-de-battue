import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppelInscription, ContentPage } from "@/features/vitrine/content";
import { GUIDES, guideParSlug } from "@/features/vitrine/guides";
import { VitrineShell } from "@/features/vitrine/site-chrome";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Pages générées au build ; tout autre slug renvoie une 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const guide = guideParSlug((await params).slug);
  if (!guide) return {};
  const url = `/guide/${guide.slug}`;
  return {
    title: { absolute: `${guide.metaTitre} | ${SITE_NAME}` },
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: guide.titre,
      description: guide.description,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const guide = guideParSlug((await params).slug);
  if (!guide) notFound();
  const index = GUIDES.indexOf(guide);
  const precedent = GUIDES[index - 1];
  const suivant = GUIDES[index + 1];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.titre,
    description: guide.description,
    inLanguage: "fr-FR",
    mainEntityOfPage: `${SITE_URL}/guide/${guide.slug}`,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <VitrineShell>
      <script
        type="application/ld+json"
        // Contenu statique (pas de saisie utilisateur).
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ContentPage
        miettes={[
          { label: "Accueil", href: "/" },
          { label: "Guide", href: "/guide" },
          { label: guide.court },
        ]}
        eyebrow={`Guide · ${index + 1}/${GUIDES.length}`}
        titre={guide.titre}
        intro={guide.intro}
      >
        {guide.contenu()}

        <nav
          aria-label="Guides précédent et suivant"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {precedent ? (
            <Link
              href={`/guide/${precedent.slug}`}
              className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 hover:border-primary"
            >
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Précédent
              </span>
              <span className="font-bold">{precedent.court}</span>
            </Link>
          ) : (
            <span />
          )}
          {suivant ? (
            <Link
              href={`/guide/${suivant.slug}`}
              className="flex flex-col items-end gap-1 rounded-2xl border border-border bg-card p-5 text-right hover:border-primary"
            >
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
                Suivant
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
              <span className="font-bold">{suivant.court}</span>
            </Link>
          ) : null}
        </nav>

        <AppelInscription />
      </ContentPage>
    </VitrineShell>
  );
}
