import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, articleParSlug } from "@/features/vitrine/articles";
import {
  AppelInscription,
  ContentPage,
  Section,
} from "@/features/vitrine/content";
import { VitrineShell } from "@/features/vitrine/site-chrome";
import { formatDateSimple } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Pages générées au build ; tout autre slug renvoie une 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const article = articleParSlug((await params).slug);
  if (!article) return {};
  const url = `/articles/${article.slug}`;
  return {
    title: { absolute: `${article.metaTitre} | ${SITE_NAME}` },
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.titre,
      description: article.description,
      publishedTime: article.publieLe,
      modifiedTime: article.modifieLe,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const article = articleParSlug((await params).slug);
  if (!article) notFound();
  const autres = ARTICLES.filter((a) => a.slug !== article.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titre,
    description: article.description,
    datePublished: article.publieLe,
    dateModified: article.modifieLe,
    inLanguage: "fr-FR",
    mainEntityOfPage: `${SITE_URL}/articles/${article.slug}`,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
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
          { label: "Articles", href: "/articles" },
          { label: article.court },
        ]}
        eyebrow={`Publié le ${formatDateSimple(article.publieLe)} · ${article.lecture} min de lecture`}
        titre={article.titre}
        intro={article.intro}
      >
        {article.contenu()}

        <Section titre="Sources et pour aller plus loin">
          <ul className="flex flex-col gap-1.5 text-ink-soft">
            {article.sources.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  {s.label}
                </a>
              </li>
            ))}
            <li>Votre fédération départementale des chasseurs (SDGC).</li>
          </ul>
          {article.modifieLe !== article.publieLe ? (
            <p className="text-sm text-ink-muted">
              Mis à jour le {formatDateSimple(article.modifieLe)}.
            </p>
          ) : null}
        </Section>

        <nav aria-label="Autres articles" className="flex flex-col gap-3">
          <span className="font-bold">À lire aussi</span>
          {autres.map((a) => (
            <Link
              key={a.slug}
              href={`/articles/${a.slug}`}
              className="rounded-2xl border border-border bg-card p-5 font-semibold hover:border-primary"
            >
              {a.titre}
            </Link>
          ))}
        </nav>

        <AppelInscription />
      </ContentPage>
    </VitrineShell>
  );
}
