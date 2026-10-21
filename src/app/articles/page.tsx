import type { Metadata } from "next";
import { ArticleCard, articlesRecents } from "@/features/vitrine/article-card";
import { ARTICLES } from "@/features/vitrine/articles";
import { AppelInscription, ContentPage } from "@/features/vitrine/content";
import { VitrineShell } from "@/features/vitrine/site-chrome";

export const metadata: Metadata = {
  title: { absolute: "Articles sur la chasse en battue | Cahier de battue" },
  description:
    "Consignes de sécurité, modèle de carnet de battue, rôle du responsable : des articles pratiques pour organiser vos battues au grand gibier.",
  alternates: { canonical: "/articles" },
  openGraph: { url: "/articles" },
};

export default function ArticlesIndexPage() {
  return (
    <VitrineShell>
      <ContentPage
        miettes={[{ label: "Accueil", href: "/" }, { label: "Articles" }]}
        eyebrow="Articles"
        titre="Organiser ses battues"
        large
        intro="Sécurité, modèles et organisation : des articles pratiques pour les présidents et responsables de battue."
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {articlesRecents(ARTICLES).map((a) => (
            <ArticleCard key={a.slug} article={a} className="bg-card" />
          ))}
        </div>
        <AppelInscription />
      </ContentPage>
    </VitrineShell>
  );
}
