import type { Metadata } from "next";
import Link from "next/link";
import { AppelInscription, ContentPage } from "@/features/vitrine/content";
import { GUIDES } from "@/features/vitrine/guides";
import { VitrineShell } from "@/features/vitrine/site-chrome";

export const metadata: Metadata = {
  title: { absolute: "Guide du cahier de battue numérique | Cahier de battue" },
  description:
    "Mode d'emploi du cahier de battue numérique : créer son cahier, pointage signé, tableau de chasse, partage du gibier, cotisations, usage sans réseau.",
  alternates: { canonical: "/guide" },
  openGraph: { url: "/guide" },
};

export default function GuideIndexPage() {
  return (
    <VitrineShell>
      <ContentPage
        miettes={[{ label: "Accueil", href: "/" }, { label: "Guide" }]}
        eyebrow="Guide"
        titre="Le guide du cahier de battue"
        intro="De la création du cahier au bilan de fin de saison : tout le fonctionnement de l'appli, étape par étape."
      >
        <ol className="flex flex-col gap-3">
          {GUIDES.map(({ slug, court, description, icon: Icon }, i) => (
            <li key={slug}>
              <Link
                href={`/guide/${slug}`}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-accent">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-lg font-bold">
                    {i + 1}. {court}
                  </span>
                  <span className="text-[15px] text-ink-muted">
                    {description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <AppelInscription />
      </ContentPage>
    </VitrineShell>
  );
}
