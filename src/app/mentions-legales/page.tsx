import type { Metadata } from "next";
import { ContentPage, P, Section } from "@/features/vitrine/content";
import { LEGAL } from "@/features/vitrine/legal";
import { VitrineShell } from "@/features/vitrine/site-chrome";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site ${SITE_NAME} : éditeur, hébergement, propriété intellectuelle.`,
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <VitrineShell>
      <ContentPage
        miettes={[
          { label: "Accueil", href: "/" },
          { label: "Mentions légales" },
        ]}
        titre="Mentions légales"
        intro={`Dernière mise à jour : ${LEGAL.miseAJour}.`}
      >
        <Section titre="Éditeur du site">
          <P>
            Le site {SITE_URL.replace(/^https?:\/\//, "")} et l&apos;application{" "}
            {SITE_NAME} sont édités à titre non professionnel par{" "}
            {LEGAL.editeur}. Conformément à l&apos;article 6-III-2 de la loi
            pour la confiance dans l&apos;économie numérique (LCEN), son
            identité et ses coordonnées ont été communiquées à l&apos;hébergeur
            du site.
          </P>
          <P>
            Contact :{" "}
            <a
              href={`mailto:${LEGAL.email}`}
              className="font-semibold text-primary underline"
            >
              {LEGAL.email}
            </a>
            .
          </P>
        </Section>

        <Section titre="Hébergement">
          <P>
            Le site est hébergé par {LEGAL.hebergeur.nom},{" "}
            {LEGAL.hebergeur.adresse} ({LEGAL.hebergeur.site}). Le serveur de
            l&apos;application est exécuté dans la région{" "}
            {LEGAL.hebergeur.region}.
          </P>
          <P>
            Les données des cahiers sont stockées par{" "}
            {LEGAL.hebergeurDonnees.nom} ({LEGAL.hebergeurDonnees.site}), région{" "}
            {LEGAL.hebergeurDonnees.region}.
          </P>
          <P>
            Le nom de domaine est enregistré auprès de {LEGAL.registrar.nom},{" "}
            {LEGAL.registrar.adresse} ({LEGAL.registrar.site}).
          </P>
        </Section>

        <Section titre="Propriété intellectuelle">
          <P>
            Les textes, visuels, logos et le logiciel {SITE_NAME} sont protégés
            par le droit de la propriété intellectuelle. Toute reproduction sans
            autorisation écrite de l&apos;éditeur est interdite. Les données
            saisies dans un cahier restent la propriété de la société de chasse
            qui les a saisies.
          </P>
        </Section>

        <Section titre="Responsabilité">
          <P>
            {SITE_NAME} est un outil d&apos;aide à la tenue du carnet de battue.
            Les informations qu&apos;il contient sont saisies sous la
            responsabilité de chaque société de chasse, qui reste tenue de
            respecter la réglementation applicable (schéma départemental de
            gestion cynégétique, plan de chasse, règles de sécurité). Les guides
            du site sont fournis à titre informatif.
          </P>
        </Section>

        <Section titre="Données personnelles">
          <P>
            Le traitement des données personnelles est décrit dans la{" "}
            <a
              href="/confidentialite"
              className="font-semibold text-primary underline"
            >
              politique de confidentialité
            </a>
            .
          </P>
        </Section>
      </ContentPage>
    </VitrineShell>
  );
}
