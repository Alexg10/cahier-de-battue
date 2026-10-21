import type { Metadata } from "next";
import { A, ContentPage, Liste, P, Section } from "@/features/vitrine/content";
import { LEGAL } from "@/features/vitrine/legal";
import { VitrineShell } from "@/features/vitrine/site-chrome";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Données collectées par ${SITE_NAME}, finalités, hébergement, durée de conservation, cookies et droits RGPD.`,
  alternates: { canonical: "/confidentialite" },
};

const mail = (
  <a
    href={`mailto:${LEGAL.email}`}
    className="font-semibold text-primary underline"
  >
    {LEGAL.email}
  </a>
);

export default function ConfidentialitePage() {
  return (
    <VitrineShell>
      <ContentPage
        miettes={[
          { label: "Accueil", href: "/" },
          { label: "Politique de confidentialité" },
        ]}
        titre="Politique de confidentialité"
        intro={`Dernière mise à jour : ${LEGAL.miseAJour}. ${SITE_NAME} ne vend aucune donnée et n'affiche aucune publicité.`}
      >
        <Section titre="Qui est responsable de vos données ?">
          <P>
            Pour les comptes utilisateurs (e-mail, nom, mot de passe), le
            responsable de traitement est l&apos;éditeur du site, joignable à{" "}
            {mail} (voir les <A href="/mentions-legales">mentions légales</A>).
          </P>
          <P>
            Pour les données saisies dans un cahier (chasseurs, invités,
            propriétaires…), la société de chasse qui tient le cahier en est
            responsable : elle décide quelles informations elle enregistre et
            pourquoi. {SITE_NAME} agit alors comme sous-traitant, uniquement
            pour fournir le service.
          </P>
        </Section>

        <Section titre="Les données traitées">
          <Liste
            items={[
              "Compte : adresse e-mail, nom, mot de passe (stocké chiffré de façon irréversible, jamais en clair).",
              "Participants, invités et propriétaires : nom, prénom, coordonnées (téléphone, e-mail, adresse), date et lieu de naissance, permis de chasser, validation annuelle, timbre grand gibier, assurance, parrain d'un invité.",
              "Battues : date, lieu, rôles, signatures manuscrites saisies à l'écran, délégations de pouvoir, cotisations réglées.",
              "Tableau de chasse et partage du gibier : espèces, bracelets, tireurs, morceaux distribués.",
              "Plans du territoire déposés dans le cahier.",
            ]}
          />
        </Section>

        <Section titre="Pourquoi ces données sont utilisées">
          <P>
            Uniquement pour faire fonctionner le cahier de battue : tenue des
            battues, exports et impressions demandés par la société, et
            synchronisation entre le téléphone et le serveur. Base légale :
            l&apos;exécution du service demandé par l&apos;utilisateur (article
            6.1.b du RGPD). Aucune donnée n&apos;est utilisée à des fins
            publicitaires, revendue ou cédée.
          </P>
        </Section>

        <Section titre="Où sont-elles hébergées ?">
          <P>
            Les données des cahiers sont stockées dans l&apos;Union européenne
            par {LEGAL.hebergeurDonnees.nom}, région{" "}
            {LEGAL.hebergeurDonnees.region}.
          </P>
          <P>
            Le serveur de l&apos;application est exécuté par{" "}
            {LEGAL.hebergeur.nom} dans l&apos;Union européenne, région{" "}
            {LEGAL.hebergeur.region} : vos données sont traitées et stockées en
            Europe. {LEGAL.hebergeur.nom} étant une société établie aux
            États-Unis, tout accès éventuel depuis l&apos;extérieur de
            l&apos;Union reste encadré par les garanties prévues par le RGPD
            (Data Privacy Framework UE–États-Unis et clauses contractuelles
            types de la Commission européenne).
          </P>
          <P>
            Pour fonctionner sans réseau, les données de la battue ouverte sont
            aussi enregistrées sur le téléphone (stockage local du navigateur),
            le temps de les synchroniser.
          </P>
        </Section>

        <Section titre="Combien de temps ?">
          <P>
            Les données sont conservées tant que le compte existe. La
            suppression d&apos;un cahier dans l&apos;application le retire de
            votre espace ; pour un effacement définitif d&apos;un cahier ou de
            votre compte, écrivez à {mail} : il est réalisé dans un délai
            d&apos;un mois.
          </P>
        </Section>

        <Section titre="Cookies et mesure d'audience">
          <P>
            {SITE_NAME} n&apos;utilise qu&apos;un cookie strictement nécessaire
            : celui qui maintient votre session de connexion. Aucun cookie
            publicitaire n&apos;est utilisé.
          </P>
          <P>
            Pour savoir quelles pages sont consultées, le site utilise Vercel
            Web Analytics, un outil de mesure d&apos;audience sans cookie : il
            enregistre de façon anonyme et agrégée la page vue, le site de
            provenance, le pays, le type d&apos;appareil et le navigateur. Les
            visiteurs ne sont pas identifiés ni suivis d&apos;un site à
            l&apos;autre, et aucune donnée saisie dans les cahiers n&apos;est
            transmise. Aucun consentement n&apos;est donc demandé.
          </P>
        </Section>

        <Section titre="Vos droits">
          <P>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
            rectification, d&apos;effacement, de limitation, de portabilité et
            d&apos;opposition. Écrivez à {mail}. Si vous êtes un chasseur
            inscrit dans le cahier d&apos;une société, vous pouvez aussi vous
            adresser directement à cette société.
          </P>
          <P>En cas de désaccord, vous pouvez saisir la CNIL (cnil.fr).</P>
        </Section>
      </ContentPage>
    </VitrineShell>
  );
}
