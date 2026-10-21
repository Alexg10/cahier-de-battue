import { A, Astuce, Etapes, Liste, P, Section } from "./content";

/**
 * Articles du site : contenus de fond (sécurité, modèles, organisation) qui
 * répondent aux recherches des responsables de battue. Chaque article cite ses
 * sources et affiche ses dates ; à relire avant publication et à tenir à jour.
 */
export type Article = {
  slug: string;
  titre: string;
  /** Titre court (cartes, fil d'Ariane). */
  court: string;
  metaTitre: string;
  description: string;
  /** Dates ISO (AAAA-MM-JJ). */
  publieLe: string;
  modifieLe: string;
  /** Temps de lecture estimé, en minutes. */
  lecture: number;
  intro: React.ReactNode;
  contenu: () => React.ReactNode;
  sources: { label: string; href: string }[];
};

const SOURCES_COMMUNES = [
  {
    label:
      "Office français de la biodiversité (OFB) — Chasse : l'OFB mobilisé pour une pratique sûre et durable",
    href: "https://ofb.gouv.fr/actualites/chasse-ofb-mobilise-pour-une-pratique-sure-et-durable",
  },
  {
    label: "Fédération nationale des chasseurs",
    href: "https://www.chasseurdefrance.com",
  },
];

export const ARTICLES: Article[] = [
  {
    slug: "consignes-de-securite-battue",
    court: "Consignes de sécurité en battue",
    titre: "Consignes de sécurité en battue : les règles et un modèle à copier",
    metaTitre: "Consignes de sécurité en battue : règles et modèle",
    description:
      "Les consignes de sécurité à rappeler avant chaque battue au grand gibier : tenue, angle de 30°, tir fichant, armes, postes. Modèle prêt à copier.",
    publieLe: "2026-10-21",
    modifieLe: "2026-10-21",
    lecture: 6,
    intro:
      "Avant chaque battue, le responsable rappelle les consignes de sécurité au rond de rendez-vous. Voici les règles essentielles, et un modèle à adapter à votre territoire.",
    contenu: () => (
      <>
        <Section titre="Pourquoi rappeler les consignes à chaque battue ?">
          <P>
            La battue au grand gibier réunit de nombreux chasseurs, traqueurs et
            chiens sur un même territoire, souvent avec une visibilité réduite.
            La plupart des accidents de chasse relèvent d&apos;un manquement aux
            règles de sécurité : tir sans identification, tir dans l&apos;axe
            d&apos;un poste voisin, arme chargée hors de l&apos;action de
            chasse. L&apos;Office français de la biodiversité publie chaque
            année un bilan des accidents qui le rappelle.
          </P>
          <P>
            Le rappel des consignes au rond de rendez-vous est donc un moment
            clé, et beaucoup de schémas départementaux de gestion cynégétique
            (SDGC) en font une obligation. Faire signer les participants après
            ce rappel permet aussi de garder la trace qu&apos;ils en ont pris
            connaissance.
          </P>
        </Section>

        <Section titre="Les règles essentielles">
          <Liste
            items={[
              <>
                <strong>Être vu</strong> : vêtement ou gilet orange fluo pour
                tous les participants, chasseurs comme traqueurs. Le port
                d&apos;effets fluorescents est souvent imposé par le SDGC ou un
                arrêté préfectoral.
              </>,
              <>
                <strong>Identifier avant de tirer</strong> : ne tirer que sur un
                animal formellement identifié, jamais sur une forme, un bruit ou
                un mouvement de végétation.
              </>,
              <>
                <strong>Respecter l&apos;angle de 30°</strong> : ne jamais tirer
                dans un angle de 30° de part et d&apos;autre de la ligne qui
                relie son poste aux postes voisins. Repérer ses voisins et
                matérialiser cet angle en arrivant au poste.
              </>,
              <>
                <strong>Tir fichant uniquement</strong> : la balle doit se
                planter dans le sol à faible distance. Pas de tir à
                l&apos;horizontale, ni en direction d&apos;une route, d&apos;un
                chemin, d&apos;une habitation ou d&apos;une ligne de crête.
              </>,
              <>
                <strong>Rester à son poste</strong> : ne pas le quitter avant le
                signal de fin de traque, et ne pas changer de place sans
                prévenir ses voisins.
              </>,
              <>
                <strong>Arme déchargée hors action de chasse</strong> :
                chargement uniquement une fois au poste et au signal de début,
                déchargement au signal de fin et pour tout déplacement,
                franchissement d&apos;obstacle ou montée en véhicule.
              </>,
              <>
                <strong>Signalisation</strong> : panneaux « chasse en cours »
                posés aux accès et sur les routes qui traversent la zone
                chassée.
              </>,
              <>
                <strong>Lucidité</strong> : aucune consommation d&apos;alcool ni
                de stupéfiants avant ou pendant la battue.
              </>,
            ]}
          />
        </Section>

        <Section titre="Modèle de consignes à copier">
          <P>
            À adapter à votre territoire (signaux, zones interdites au tir,
            espèces), puis à coller dans les réglages de votre cahier :
          </P>
          <pre className="overflow-x-auto rounded-2xl border border-border bg-card p-5 text-[15px] leading-relaxed whitespace-pre-wrap text-ink-soft">
            {`1. Port obligatoire d'un gilet ou vêtement orange fluo pour tous.
2. Arme chargée uniquement au poste, après le signal de début de traque.
3. Repérer ses voisins et respecter l'angle de 30° : aucun tir dans leur direction.
4. Tir fichant uniquement ; aucun tir vers les routes, chemins et habitations.
5. Ne tirer que sur un animal formellement identifié.
6. Ne pas quitter son poste avant le signal de fin de traque.
7. Arme déchargée pour tout déplacement et à la fin de chaque traque.
8. Signaler tout animal blessé au responsable ; pas de recherche seul.
9. Alcool et stupéfiants interdits avant et pendant la battue.
10. Respect des consignes du responsable de battue, qui peut exclure tout contrevenant.`}
          </pre>
          <Astuce>
            Dans Cahier de battue, ces consignes s&apos;affichent en tête de
            chaque battue, et chaque participant les accepte en signant le
            pointage. Voir{" "}
            <A href="/guide/organiser-une-battue">Organiser une battue</A>.
          </Astuce>
        </Section>

        <Section titre="Avant de valider vos consignes">
          <P>
            Les règles de sécurité peuvent être complétées localement par le
            schéma départemental de gestion cynégétique ou par arrêté
            préfectoral (couleur et type de vêtements, signalisation, zones
            protégées). Vérifiez les obligations de votre département auprès de
            votre fédération départementale des chasseurs.
          </P>
        </Section>
      </>
    ),
    sources: SOURCES_COMMUNES,
  },
  {
    slug: "modele-carnet-de-battue",
    court: "Modèle de carnet de battue",
    titre: "Modèle de carnet de battue gratuit à imprimer",
    metaTitre: "Modèle de carnet de battue gratuit (PDF à imprimer)",
    description:
      "Un modèle de carnet de battue gratuit à imprimer ou enregistrer en PDF : informations du jour, consignes, pointage signé et tableau de chasse.",
    publieLe: "2026-10-21",
    modifieLe: "2026-10-21",
    lecture: 4,
    intro:
      "Vous cherchez un carnet de battue prêt à remplir ? Voici un modèle gratuit, et ce qu'il doit contenir pour être complet.",
    contenu: () => (
      <>
        <Section titre="Télécharger le modèle">
          <P>
            Le modèle tient sur une feuille par battue : informations du jour,
            responsable, rappel des consignes, tableau de pointage à faire
            signer et tableau de chasse.
          </P>
          <P>
            <A href="/modele-carnet-de-battue">
              Ouvrir le modèle de carnet de battue
            </A>{" "}
            puis cliquez sur « Imprimer / Enregistrer en PDF ».
          </P>
        </Section>

        <Section titre="Ce que contient le modèle">
          <Liste
            items={[
              "En-tête : société de chasse, territoire, saison, n° de battue.",
              "Informations du jour : date, lieu, heures de début et de fin, espèces chassées, responsable de battue.",
              "Encadré de rappel des consignes de sécurité.",
              "Pointage : nom, n° de permis, validation, assurance, rôle (posté, traqueur, accompagnant) et signature de chaque participant.",
              "Tableau de chasse : espèce, n° de bracelet, sexe, âge, poids et tireur.",
            ]}
          />
          <P>
            Pour rédiger le rappel des consignes, inspirez-vous de notre{" "}
            <A href="/articles/consignes-de-securite-battue">
              modèle de consignes de sécurité
            </A>
            .
          </P>
        </Section>

        <Section titre="Les limites du carnet papier">
          <P>
            Le papier fait l&apos;affaire, mais il faut recopier chaque saison
            les permis et assurances, il supporte mal la pluie, et le bilan de
            fin de saison demande des heures de ressaisie. Le partage du gibier
            et les cotisations finissent souvent sur une feuille à part.
          </P>
          <Astuce>
            Cahier de battue reprend exactement ce modèle sur téléphone : fiches
            des chasseurs saisies une fois, signature au doigt, tableau de
            chasse et partage du gibier, même sans réseau, puis export Excel en
            fin de saison. C&apos;est gratuit :{" "}
            <A href="/inscription">créer mon cahier</A>.
          </Astuce>
        </Section>
      </>
    ),
    sources: [
      {
        label: "Fédération nationale des chasseurs",
        href: "https://www.chasseurdefrance.com",
      },
    ],
  },
  {
    slug: "role-du-responsable-de-battue",
    court: "Le responsable de battue",
    titre: "Le responsable de battue : rôle, missions et délégation",
    metaTitre: "Responsable de battue : rôle, missions et délégation",
    description:
      "Qui est le responsable de battue, quelles sont ses missions avant, pendant et après la battue, et comment fonctionne la délégation de pouvoir.",
    publieLe: "2026-10-21",
    modifieLe: "2026-10-21",
    lecture: 5,
    intro:
      "Chaque battue a un responsable, garant de son organisation et de la sécurité. Voici ce que recouvre ce rôle, de la préparation au bilan.",
    contenu: () => (
      <>
        <Section titre="Qui est le responsable de battue ?">
          <P>
            C&apos;est la personne qui dirige la battue et en assume
            l&apos;organisation. Le plus souvent, c&apos;est le président de la
            société de chasse ou de l&apos;ACCA, détenteur du droit de chasse.
            Il peut confier ce rôle, pour une journée, à un autre chasseur
            expérimenté par une délégation de pouvoir écrite.
          </P>
          <P>
            Les conditions exactes (qualification, formation, obligations)
            dépendent du schéma départemental de gestion cynégétique et du
            règlement intérieur de la société : renseignez-vous auprès de votre
            fédération départementale.
          </P>
        </Section>

        <Section titre="Ses missions, étape par étape">
          <Etapes
            items={[
              {
                titre: "Préparer",
                texte:
                  "Choisir les secteurs et les postes, vérifier le plan de chasse et les bracelets disponibles, prévoir la signalisation « chasse en cours ».",
              },
              {
                titre: "Accueillir et vérifier",
                texte:
                  "Au rond de rendez-vous, contrôler les permis, validations et assurances, et accueillir les invités et leur parrain.",
              },
              {
                titre: "Rappeler les consignes",
                texte:
                  "Lire les consignes de sécurité, annoncer les signaux de début et de fin, puis faire signer le carnet de battue.",
              },
              {
                titre: "Diriger la battue",
                texte:
                  "Placer les postes, coordonner les traqueurs et les chiens, faire respecter les règles et exclure tout contrevenant.",
              },
              {
                titre: "Clôturer",
                texte:
                  "Noter chaque animal prélevé et son bracelet, organiser le partage de la venaison et compléter le carnet.",
              },
            ]}
          />
        </Section>

        <Section titre="La délégation de pouvoir">
          <P>
            Lorsque le président ne dirige pas la battue, il délègue cette
            responsabilité par écrit : la délégation précise le territoire, la
            saison, la date et le délégué, et elle est signée par les deux
            parties. Les responsabilités liées à l&apos;organisation de la
            battue incombent alors au délégué.
          </P>
          <Astuce>
            Dans Cahier de battue, la délégation apparaît automatiquement dès
            que le responsable n&apos;est pas le président : le texte est
            prérempli et les deux parties signent à l&apos;écran. Voir{" "}
            <A href="/guide/organiser-une-battue">Organiser une battue</A>.
          </Astuce>
        </Section>

        <Section titre="Ses outils">
          <P>
            Le carnet de battue est l&apos;outil central du responsable : il
            prouve que les consignes ont été rappelées, qui était présent et ce
            qui a été prélevé. Pour en préparer un, consultez notre{" "}
            <A href="/articles/modele-carnet-de-battue">
              modèle de carnet de battue
            </A>{" "}
            et nos{" "}
            <A href="/articles/consignes-de-securite-battue">
              consignes de sécurité
            </A>
            .
          </P>
        </Section>
      </>
    ),
    sources: SOURCES_COMMUNES,
  },
];

export const articleParSlug = (slug: string) =>
  ARTICLES.find((a) => a.slug === slug);
