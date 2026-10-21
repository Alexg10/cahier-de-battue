import {
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  PenLine,
  Settings,
  Split,
  Tag,
  Users,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { A, Astuce, Etapes, Liste, P, Section } from "./content";

/**
 * Guides du site : une page par étape d'utilisation du cahier de battue, et
 * par intention de recherche (« carnet de battue », « partage du gibier »…).
 * L'ordre du tableau est l'ordre de lecture (précédent / suivant).
 */
export type Guide = {
  slug: string;
  /** Titre de la page (H1). */
  titre: string;
  /** Titre court pour les cartes et la navigation. */
  court: string;
  /** Balise <title> (≤ 60 caractères idéalement). */
  metaTitre: string;
  /** Description Google (≈ 150 caractères). */
  description: string;
  icon: LucideIcon;
  intro: React.ReactNode;
  contenu: () => React.ReactNode;
};

export const GUIDES: Guide[] = [
  {
    slug: "carnet-de-battue",
    court: "Le carnet de battue",
    titre: "Le carnet de battue : à quoi sert-il, que doit-il contenir ?",
    metaTitre: "Carnet de battue : rôle, contenu et version numérique",
    description:
      "Ce que contient un carnet de battue (consignes, participants, signatures, prélèvements) et comment le tenir sur téléphone avec Cahier de battue.",
    icon: BookOpen,
    intro:
      "Le carnet (ou cahier) de battue est le registre de chaque journée de chasse collective au grand gibier. Voici ce qu'on y note, et comment le tenir sans papier.",
    contenu: () => (
      <>
        <Section titre="À quoi sert le carnet de battue ?">
          <P>
            Il garde la trace de chaque battue organisée par la société de
            chasse ou l&apos;ACCA : qui était présent, avec quel rôle, sous la
            responsabilité de qui, et quels animaux ont été prélevés. Il prouve
            aussi que les consignes de sécurité ont été rappelées et acceptées
            par chaque participant.
          </P>
          <P>
            Dans de nombreux départements, le schéma départemental de gestion
            cynégétique (SDGC) impose sa tenue pour la chasse collective au
            grand gibier. Les règles varient d&apos;un département à
            l&apos;autre : renseignez-vous auprès de votre fédération
            départementale des chasseurs.
          </P>
        </Section>
        <Section titre="Ce que l'on y note à chaque battue">
          <Liste
            items={[
              "La date, le lieu, les horaires et les espèces chassées ce jour-là.",
              "Le responsable de battue, et la délégation de pouvoir signée si ce n'est pas le président.",
              "Les consignes de sécurité rappelées au rond de rendez-vous.",
              "La liste des participants (postés, traqueurs, accompagnants, invités) avec leur signature.",
              "Pour chaque chasseur : permis de chasser, validation annuelle et assurance.",
              "Le tableau de chasse : espèce, n° de bracelet, sexe, âge, poids et tireur.",
            ]}
          />
        </Section>
        <Section titre="Le carnet de battue numérique">
          <P>
            Cahier de battue reprend toutes ces rubriques sur le téléphone du
            responsable. Les fiches des chasseurs sont saisies une seule fois,
            chacun signe au doigt sur l&apos;écran, et le tableau de chasse se
            remplit sur le terrain, même sans réseau. En fin de saison, tout
            s&apos;exporte en Excel ou s&apos;imprime pour l&apos;archive.
          </P>
          <P>
            Pour démarrer, suivez le guide{" "}
            <A href="/guide/creer-son-cahier">
              Créer le cahier de votre société
            </A>
            .
          </P>
        </Section>
      </>
    ),
  },
  {
    slug: "creer-son-cahier",
    court: "Créer son cahier",
    titre: "Créer le cahier de battue de votre société de chasse",
    metaTitre: "Créer un cahier de battue en ligne pour sa société",
    description:
      "Créez gratuitement le cahier de battue de votre société de chasse : nom, territoire, saison, import des chasseurs, espèces, morceaux et cotisations.",
    icon: Settings,
    intro:
      "En quelques minutes, le cahier de votre société est prêt : un compte, un cahier par saison, et vos réglages repris d'une saison à l'autre.",
    contenu: () => (
      <>
        <Section titre="Les étapes">
          <Etapes
            items={[
              {
                titre: "Créez votre compte",
                texte: (
                  <>
                    Sur la page <A href="/inscription">Créer un compte</A>, avec
                    une adresse e-mail et un mot de passe. C&apos;est gratuit et
                    sans carte bancaire.
                  </>
                ),
              },
              {
                titre: "Créez le cahier de la saison",
                texte:
                  "Indiquez le nom de la société de chasse, le territoire et la saison (ex. 2026/2027).",
              },
              {
                titre: "Importez votre liste de chasseurs (facultatif)",
                texte:
                  "Un fichier Excel (.xlsx) ou CSV avec les colonnes nom, prénom, téléphone, permis et e-mail suffit. Seuls le nom et le prénom sont obligatoires.",
              },
              {
                titre: "Vérifiez les réglages",
                texte:
                  "Espèces chassables, morceaux de la distribution, montants des cotisations et consignes de sécurité.",
              },
            ]}
          />
        </Section>
        <Section titre="Les réglages du cahier">
          <Liste
            items={[
              "Espèces chassables : chevreuil, cerf, sanglier, renard, lièvre… modifiables à volonté.",
              "Morceaux de la distribution : gigot, épaule, filet, côtes, abats… chacun avec un code court pour le récapitulatif.",
              "Espèces découpées en morceaux : par défaut chevreuil, cerf et sanglier ; les autres espèces se partagent entières.",
              "Cotisations « chasse » et « chiens » : montant par battue.",
              "Règles d'organisation et consignes de sécurité : affichées sur chaque battue, avant la signature.",
            ]}
          />
        </Section>
        <Section titre="Une nouvelle saison en un clic">
          <P>
            À la fin de la saison, dupliquez le cahier : participants,
            propriétaires, bureau, espèces, morceaux et consignes sont repris.
            Seules les battues repartent de zéro.
          </P>
          <Astuce>
            Ensuite, complétez les fiches de vos chasseurs : voir{" "}
            <A href="/guide/participants-et-bureau">
              Participants, bureau et propriétaires
            </A>
            .
          </Astuce>
        </Section>
      </>
    ),
  },
  {
    slug: "participants-et-bureau",
    court: "Participants et bureau",
    titre: "Participants, bureau et propriétaires",
    metaTitre: "Gérer les chasseurs, le bureau et les propriétaires",
    description:
      "Fiches des chasseurs (permis, validation, timbre grand gibier, assurance), traqueurs et accompagnants, bureau de la société et propriétaires fonciers.",
    icon: Users,
    intro:
      "Les fiches des membres sont saisies une fois pour toute la saison, et reprises automatiquement à la suivante.",
    contenu: () => (
      <>
        <Section titre="Chasseurs, traqueurs et accompagnants">
          <P>
            Chaque participant a un type : <strong>chasseur</strong> (avec
            permis), <strong>traqueur</strong> ou <strong>accompagnant</strong>.
            Pour un chasseur, la fiche regroupe :
          </P>
          <Liste
            items={[
              "Coordonnées : téléphone, e-mail, adresse, date et lieu de naissance.",
              "Permis de chasser : numéro, date et lieu de délivrance.",
              "Validation annuelle : numéro et étendue (départementale, bi-départementale ou nationale).",
              "Timbre grand gibier : national ou départemental.",
              "Assurance : compagnie, agent ou courtier, numéro de contrat.",
            ]}
          />
          <P>
            Une fiche incomplète est signalée au pointage, et le responsable
            peut corriger un numéro de permis ou d&apos;assurance directement
            sur le terrain.
          </P>
        </Section>
        <Section titre="Le bureau de la société">
          <P>
            Désignez le <strong>président</strong>, le{" "}
            <strong>trésorier</strong> et le <strong>secrétaire</strong>. Le
            président est le responsable de battue par défaut ; s&apos;il confie
            la battue à un autre chasseur, une délégation de pouvoir est signée
            dans l&apos;appli.
          </P>
        </Section>
        <Section titre="Propriétaires et plans du territoire">
          <P>
            Les propriétaires fonciers sont enregistrés avec leurs coordonnées.
            Un propriétaire qui chasse est lié à sa fiche de chasseur pour ne
            pas apparaître en double, et chacun peut avoir un{" "}
            <strong>référent</strong> dans la société (à qui remettre sa part de
            gibier, par exemple). Les plans du territoire (JPG ou PDF) sont
            rangés dans le cahier, toujours à portée de main.
          </P>
          <Astuce>
            Les propriétaires apparaissent dans la{" "}
            <A href="/guide/partage-du-gibier">distribution du gibier</A> à
            chaque battue.
          </Astuce>
        </Section>
      </>
    ),
  },
  {
    slug: "organiser-une-battue",
    court: "Organiser une battue",
    titre: "Organiser une battue : préparation, consignes et délégation",
    metaTitre: "Organiser une battue au grand gibier : préparation",
    description:
      "Préparer une battue avec Cahier de battue : date, lieu, horaires, responsable, espèces du jour, consignes de sécurité et délégation de pouvoir signée.",
    icon: CalendarDays,
    intro:
      "Chaque battue a sa page, qui suit la journée dans l'ordre : consignes, délégation, pointage, invités, tableau de chasse et partage.",
    contenu: () => (
      <>
        <Section titre="Créer la battue">
          <P>
            Renseignez la date, le lieu, les heures de début et de fin, le
            responsable de battue et les espèces chassées ce jour-là. Chaque
            battue reçoit un numéro dans la saison (n° 1, n° 2…), repris dans
            les exports.
          </P>
          <Astuce>
            Ouvrez la page de la battue avec du réseau avant de partir : elle
            est alors enregistrée sur le téléphone et fonctionne au fond des
            bois. Voir{" "}
            <A href="/guide/hors-reseau">Utiliser l&apos;appli sans réseau</A>.
          </Astuce>
        </Section>
        <Section titre="Consignes de sécurité">
          <P>
            Les règles d&apos;organisation et consignes de sécurité du cahier
            (gilet fluo, angles de tir, tir fichant, déchargement des armes…)
            s&apos;affichent en tête de la battue, pour être lues au rond de
            rendez-vous. En signant le pointage, chaque participant reconnaît en
            avoir pris connaissance.
          </P>
        </Section>
        <Section titre="Délégation de pouvoir">
          <P>
            Si le responsable de la battue n&apos;est pas le président, la
            délégation de pouvoir apparaît automatiquement : le texte est
            prérempli (territoire, saison, date, lieu) et les deux parties
            signent à l&apos;écran. Elle figure ensuite sur la feuille de battue
            imprimée.
          </P>
        </Section>
      </>
    ),
  },
  {
    slug: "pointage-et-signatures",
    court: "Pointage et signatures",
    titre: "Le pointage : signatures, rôles et invités",
    metaTitre: "Pointage des chasseurs et signature au doigt",
    description:
      "Faire signer les chasseurs au doigt sur le téléphone, noter le rôle (posté, traqueur, accompagnant), les cotisations et ajouter des invités parrainés.",
    icon: PenLine,
    intro:
      "Au rond de rendez-vous, chacun signe le carnet du jour directement sur l'écran du responsable.",
    contenu: () => (
      <>
        <Section titre="Faire signer les participants">
          <Etapes
            items={[
              {
                titre: "Trouvez le participant",
                texte:
                  "La liste des membres est triée par nom. Le compteur indique combien ont déjà signé.",
              },
              {
                titre: "Choisissez son rôle",
                texte: "Posté, traqueur ou accompagnant pour la journée.",
              },
              {
                titre: "Cochez ses cotisations",
                texte: "Cotisation « chasse » et/ou « chiens » réglée ce jour.",
              },
              {
                titre: "Il signe au doigt",
                texte:
                  "La signature est enregistrée sur le téléphone, avec l'heure.",
              },
            ]}
          />
          <P>
            Avec plus de 100 membres, réduisez la section pointage une fois
            terminé pour passer directement au tableau de chasse.
          </P>
        </Section>
        <Section titre="Ajouter un invité">
          <P>
            Un invité est toujours rattaché à un <strong>parrain</strong> : un
            chasseur de la société ou un propriétaire. Sa fiche (permis,
            validation, assurance) est gardée dans le cahier et se réutilise
            d&apos;une battue à l&apos;autre. Choisissez un invité déjà connu,
            ou créez-en un nouveau sur place, même sans réseau : il est
            utilisable tout de suite et ajouté au cahier au retour de la
            connexion.
          </P>
          <P>
            Sur la feuille de battue, les invités figurent avec les
            participants, repérés par un libellé « Invité » et le nom de leur
            parrain.
          </P>
        </Section>
      </>
    ),
  },
  {
    slug: "tableau-de-chasse",
    court: "Tableau de chasse",
    titre: "Tenir le tableau de chasse sur le terrain",
    metaTitre: "Tableau de chasse : saisir les prélèvements",
    description:
      "Noter chaque animal prélevé pendant la battue : espèce, n° de bracelet, sexe, âge, poids et tireur, membre ou invité. Récapitulatif de saison en Excel.",
    icon: Tag,
    intro:
      "Chaque animal prélevé est noté au moment où il est ramené, même sans réseau.",
    contenu: () => (
      <>
        <Section titre="Ce que l'on note pour chaque prélèvement">
          <Liste
            items={[
              "L'espèce, parmi les espèces chassées ce jour-là.",
              "Le numéro de bracelet du plan de chasse.",
              "Le sexe (mâle, femelle, indéterminé) et l'âge.",
              "Le poids en kilos (la virgule est acceptée, ex. 42,5).",
              "Le tireur : un membre de la société ou un invité.",
            ]}
          />
        </Section>
        <Section titre="Et ensuite ?">
          <P>
            Le tireur reçoit automatiquement son gigot pour les espèces
            découpées (voir{" "}
            <A href="/guide/partage-du-gibier">Partage du gibier</A>). En fin de
            saison, le tableau de chasse complet, battue par battue,
            s&apos;exporte en Excel pour la fédération ou l&apos;assemblée
            générale.
          </P>
        </Section>
      </>
    ),
  },
  {
    slug: "partage-du-gibier",
    court: "Partage du gibier",
    titre: "Le partage du gibier, battue par battue",
    metaTitre: "Partage du gibier en battue : gigot tireur et morceaux",
    description:
      "Répartir la venaison après la battue : gigot du tireur d'office, morceaux par espèce (gigot sanglier, épaule chevreuil…), propriétaires et invités.",
    icon: Split,
    intro:
      "Fini le partage noté sur un coin de page : chaque morceau distribué est tracé, battue par battue.",
    contenu: () => (
      <>
        <Section titre="Qui reçoit sa part ?">
          <P>La liste des bénéficiaires est construite automatiquement :</P>
          <Liste
            items={[
              <>
                <strong>Les tireurs</strong>, en premier : tous ceux qui ont
                prélevé un animal ce jour-là.
              </>,
              <>
                <strong>Les propriétaires</strong> du territoire, y compris les
                chasseurs propriétaires absents ce jour-là.
              </>,
              <>
                <strong>Les autres participants</strong> présents au pointage,
                invités compris.
              </>,
            ]}
          />
        </Section>
        <Section titre="Morceaux et espèces">
          <P>
            Seules les espèces tirées le jour même sont proposées. Pour les
            espèces découpées (par défaut chevreuil, cerf et sanglier), chaque
            morceau est suivi de l&apos;espèce : « Gigot Sanglier », « Épaule
            Chevreuil »… Les autres espèces (pigeon, lièvre, faisan…) se donnent
            entières, sous leur seul nom.
          </P>
          <P>
            Le <strong>gigot du tireur</strong> est attribué d&apos;office à
            celui qui a tiré l&apos;animal, une fois par animal. La liste des
            morceaux et des espèces découpées se règle dans les réglages du
            cahier.
          </P>
        </Section>
        <Section titre="Le récapitulatif de la saison">
          <P>
            Un tableau croise les bénéficiaires et les battues, avec une
            pastille de couleur par espèce (Sg sanglier, Ch chevreuil, Ce
            cerf…). Il s&apos;imprime ou s&apos;exporte en Excel pour vérifier
            que le partage reste équitable sur la saison.
          </P>
        </Section>
      </>
    ),
  },
  {
    slug: "cotisations",
    court: "Cotisations",
    titre: "Les cotisations de battue, sans tableur",
    metaTitre: "Cotisations de société de chasse : suivi par battue",
    description:
      "Suivre les cotisations « chasse » et « chiens » de chaque battue : cochées au pointage, totalisées par battue et par participant pour le trésorier.",
    icon: FileSpreadsheet,
    intro:
      "Les cotisations sont cochées au pointage : le trésorier n'a plus rien à recopier.",
    contenu: () => (
      <>
        <Section titre="Comment ça marche">
          <Etapes
            items={[
              {
                titre: "Fixez les montants",
                texte:
                  "Dans les réglages du cahier : une cotisation « chasse » et une cotisation « chiens » par battue.",
              },
              {
                titre: "Cochez au pointage",
                texte:
                  "Au moment de la signature, cochez ce que chaque participant a réglé. Le total récolté s'affiche en direct.",
              },
              {
                titre: "Consultez le récapitulatif",
                texte:
                  "Un tableau participants × battues détaille, pour chaque battue, la part chasse et la part chiens, avec les totaux.",
              },
            ]}
          />
          <P>
            Les invités ne sont pas concernés par les cotisations. Le
            récapitulatif s&apos;imprime ou s&apos;exporte en Excel pour
            l&apos;assemblée générale.
          </P>
        </Section>
      </>
    ),
  },
  {
    slug: "hors-reseau",
    court: "Sans réseau",
    titre: "Utiliser le cahier de battue sans réseau",
    metaTitre: "Application de chasse hors ligne : mode sans réseau",
    description:
      "Cahier de battue fonctionne sans réseau au fond des bois : pointage, invités, tableau de chasse et partage enregistrés sur le téléphone puis synchronisés.",
    icon: WifiOff,
    intro:
      "Au fond du bois, pas de barre de réseau ? L'appli continue de fonctionner et se synchronise toute seule au retour de la connexion.",
    contenu: () => (
      <>
        <Section titre="Avant de partir">
          <Etapes
            items={[
              {
                titre: "Ajoutez l'appli à l'écran d'accueil",
                texte:
                  "Depuis le navigateur du téléphone (« Ajouter à l'écran d'accueil ») : elle s'ouvre ensuite comme une application.",
              },
              {
                titre: "Ouvrez la battue avec du réseau",
                texte:
                  "La page de la battue, la liste des participants, des propriétaires et des invités sont alors enregistrées sur le téléphone.",
              },
            ]}
          />
        </Section>
        <Section titre="Ce qui fonctionne sans réseau">
          <Liste
            items={[
              "Le pointage : signatures, rôles et cotisations.",
              "La délégation de pouvoir signée.",
              "Les invités, y compris la création d'un nouvel invité.",
              "La correction des fiches (téléphone, permis, validation, assurance).",
              "Le tableau de chasse et le partage du gibier.",
            ]}
          />
          <P>
            Un badge indique ce qui reste à synchroniser. Dès que le réseau
            revient, tout est envoyé automatiquement ; si la connexion coupe
            pendant l&apos;envoi, rien n&apos;est perdu ni dupliqué.
          </P>
        </Section>
        <Astuce>
          Créer une nouvelle battue ou un nouveau membre nécessite du réseau :
          préparez-les avant de partir.
        </Astuce>
      </>
    ),
  },
  {
    slug: "exports-et-fin-de-saison",
    court: "Exports et fin de saison",
    titre: "Exports, impression et bilan de fin de saison",
    metaTitre: "Exporter le carnet de battue en Excel et PDF",
    description:
      "Feuille de battue, participants, propriétaires, cotisations et partage du gibier : exports Excel et versions imprimables pour la fédération et l'AG.",
    icon: FileSpreadsheet,
    intro:
      "Tout est rangé au fil des battues : le bilan de saison est prêt quand vous en avez besoin.",
    contenu: () => (
      <>
        <Section titre="Ce que vous pouvez exporter ou imprimer">
          <Liste
            items={[
              <>
                <strong>La feuille de battue</strong> : informations du jour,
                consignes, délégation, pointage des participants (invités
                repérés) puis des traqueurs, signatures, tableau de chasse et
                total des cotisations.
              </>,
              <>
                <strong>Les participants</strong> et{" "}
                <strong>les propriétaires</strong> de la saison.
              </>,
              <>
                <strong>Les cotisations</strong> : participants × battues, part
                chasse et part chiens.
              </>,
              <>
                <strong>Le partage du gibier</strong> : bénéficiaires × battues,
                avec la légende des morceaux et des espèces.
              </>,
              <>
                <strong>Le récapitulatif de saison</strong> : participants,
                battues et prélèvements dans un même classeur Excel.
              </>,
            ]}
          />
        </Section>
        <Section titre="Imprimer pour l'archive">
          <P>
            Chaque document a une version prête à imprimer (ou à enregistrer en
            PDF depuis le navigateur). La feuille de battue commence le pointage
            dès la première page et répète les en-têtes de colonnes sur les
            suivantes.
          </P>
          <Astuce>
            Pour la saison suivante, dupliquez le cahier : voir{" "}
            <A href="/guide/creer-son-cahier">
              Créer le cahier de votre société
            </A>
            .
          </Astuce>
        </Section>
      </>
    ),
  },
];

export const guideParSlug = (slug: string) =>
  GUIDES.find((g) => g.slug === slug);
