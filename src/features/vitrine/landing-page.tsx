import {
  ArrowRight,
  Check,
  FileSpreadsheet,
  Map as MapIcon,
  PenLine,
  ShieldCheck,
  Split,
  Tag,
  UserPlus,
  Users,
  Wallet,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ArticleCard, articlesRecents } from "./article-card";
import { ARTICLES } from "./articles";
import { GUIDES } from "./guides";
import { PhoneMockup } from "./phone-mockup";
import { container, ctaBlaze, Eyebrow, VitrineShell } from "./site-chrome";

/* ------------------------------------------------------------------ */
/* Contenu                                                             */
/* ------------------------------------------------------------------ */

const ARGUMENTS_HERO = [
  "Gratuit, sans carte bancaire",
  "Sur téléphone, sans installation",
  "Fonctionne hors réseau",
  "Export Excel & impression",
];

const AVANT = [
  "Un cahier qui prend l'eau sur le capot",
  "Des permis et assurances à recopier chaque saison",
  "Le partage du gibier noté sur un coin de page",
  "Des heures de ressaisie pour le bilan de fin de saison",
];

const APRES = [
  "Tout tient dans le téléphone du responsable",
  "Fiches participants saisies une fois, reprises chaque saison",
  "Partage des morceaux tracé battue par battue",
  "Tableau de chasse et cotisations exportés en un clic",
];

const FONCTIONNALITES: { icon: LucideIcon; titre: string; texte: string }[] = [
  {
    icon: Users,
    titre: "Participants & bureau",
    texte:
      "Chasseurs, traqueurs et accompagnants avec permis, validation, timbre grand gibier et assurance. Président, trésorier et secrétaire désignés. Import d'une liste existante.",
  },
  {
    icon: PenLine,
    titre: "Pointage signé au doigt",
    texte:
      "Chaque participant signe le carnet du jour directement sur l'écran, avec son rôle (posté, traqueur, accompagnant) et ses cotisations cochées.",
  },
  {
    icon: Tag,
    titre: "Tableau de chasse",
    texte:
      "Chaque prélèvement est noté sur le terrain : espèce, n° de bracelet, sexe, âge, poids et tireur — membre ou invité.",
  },
  {
    icon: Split,
    titre: "Partage du gibier",
    texte:
      "Gigot du tireur attribué d'office, puis épaules, filets, côtes et abats répartis entre participants, propriétaires et invités. Vos morceaux sont personnalisables.",
  },
  {
    icon: Wallet,
    titre: "Cotisations",
    texte:
      "Montants « chasse » et « chiens » définis par battue, encaissements cochés au pointage, récapitulatif par participant pour le trésorier.",
  },
  {
    icon: ShieldCheck,
    titre: "Sécurité & délégation",
    texte:
      "Consignes de sécurité affichées à chaque battue. Quand le président délègue, la délégation de pouvoir est signée par les deux parties dans l'appli.",
  },
  {
    icon: UserPlus,
    titre: "Invités parrainés",
    texte:
      "Un invité est rattaché à un chasseur ou à un propriétaire, avec permis et assurance. Sa fiche se réutilise d'une battue à l'autre.",
  },
  {
    icon: MapIcon,
    titre: "Propriétaires & plans",
    texte:
      "Les propriétaires fonciers et leur référent dans la société, et les plans du territoire (JPG ou PDF) toujours à portée de main.",
  },
  {
    icon: FileSpreadsheet,
    titre: "Exports & impression",
    texte:
      "Feuille de battue, liste des participants, partage et cotisations : en Excel ou prêts à imprimer. Et une nouvelle saison se crée en un clic.",
  },
];

const ETAPES = [
  {
    titre: "Préparer",
    texte:
      "Date, lieu, horaires, espèces du jour et responsable. La page de la battue est enregistrée sur le téléphone avant de partir.",
  },
  {
    titre: "Rendez-vous",
    texte:
      "Lecture des consignes de sécurité, délégation signée si besoin, puis pointage : chacun signe et règle ses cotisations.",
  },
  {
    titre: "Chasser",
    texte:
      "Chaque animal prélevé est saisi avec son bracelet et son tireur, même sans aucune barre de réseau.",
  },
  {
    titre: "Partager & clôturer",
    texte:
      "Répartition des morceaux, clôture de la battue. Tout se synchronise au retour du réseau.",
  },
];

const TIMELINE_SYNC: { icon: LucideIcon; titre: string; texte: string; ok?: boolean }[] = [
  { icon: WifiOff, titre: "9 h 12 · Hors-ligne", texte: "6 signatures enregistrées sur l'appareil" },
  { icon: Tag, titre: "11 h 40 · Hors-ligne", texte: "2 prélèvements ajoutés" },
  { icon: Check, titre: "13 h 05 · Réseau retrouvé", texte: "Tout est synchronisé", ok: true },
];

const PRELEVEMENTS = [
  { battue: "n°7", espece: "Sanglier", bracelet: "SAN-0412", sexe: "Mâle", poids: "62 kg", tireur: "MARTIN P." },
  { battue: "n°7", espece: "Chevreuil", bracelet: "CHE-1187", sexe: "Femelle", poids: "21 kg", tireur: "ROUX C." },
  { battue: "n°6", espece: "Sanglier", bracelet: "SAN-0398", sexe: "Femelle", poids: "48 kg", tireur: "DURAND M. (invité)" },
  { battue: "n°5", espece: "Cerf", bracelet: "CER-0057", sexe: "Mâle", poids: "96 kg", tireur: "BERNARD L." },
];

const ROLES = [
  { titre: "Le président", texte: "Un cahier conforme et complet, des consignes partagées, des délégations signées." },
  { titre: "Le responsable de battue", texte: "Pointage, prélèvements et partage depuis son téléphone, sur le terrain." },
  { titre: "Le trésorier", texte: "Les cotisations de chaque battue, pointées et récapitulées sans tableur à tenir." },
  { titre: "Le secrétaire", texte: "Fiches des chasseurs, propriétaires et invités à jour, exports prêts pour l'AG." },
];

const FAQ = [
  {
    q: "Qu'est-ce qu'un cahier de battue ?",
    r: "Le cahier (ou carnet) de battue est le registre tenu à chaque battue au grand gibier : date, lieu, consignes de sécurité, liste signée des participants et animaux prélevés. Cahier de battue en est la version numérique.",
  },
  {
    q: "Le carnet de battue est-il obligatoire ?",
    r: "Dans de nombreux départements, le schéma départemental de gestion cynégétique (SDGC) impose un carnet de battue pour la chasse collective au grand gibier. Les règles varient : renseignez-vous auprès de votre fédération départementale des chasseurs.",
  },
  {
    q: "Est-ce adapté à une ACCA ou à une petite chasse privée ?",
    r: "Oui. De quelques chasseurs à plus de 100 participants, les mêmes fonctionnalités sont disponibles, gratuitement.",
  },
  {
    q: "Faut-il installer une application ?",
    r: "Non. Cahier de battue s'ouvre dans le navigateur du téléphone et peut s'ajouter à l'écran d'accueil pour s'utiliser comme une appli.",
  },
  {
    q: "Comment ça marche sans réseau ?",
    r: "Ouvrez la page de la battue avec du réseau avant de partir. Ensuite tout ce que vous saisissez est enregistré sur le téléphone et envoyé automatiquement quand la connexion revient.",
  },
  {
    q: "Puis-je reprendre ma liste de chasseurs ?",
    r: "Oui, la liste des participants peut être importée, puis reprise automatiquement à chaque nouvelle saison.",
  },
  {
    q: "C'est vraiment gratuit ?",
    r: "Oui. Cahier de battue est entièrement gratuit : toutes les fonctionnalités, sans abonnement et sans carte bancaire.",
  },
  {
    q: "Puis-je imprimer le cahier ?",
    r: "Oui. Feuille de battue, participants, propriétaires, partage et cotisations ont chacun une version imprimable, en plus de l'export Excel.",
  },
];

/**
 * Données structurées (schema.org) : le logiciel, gratuit, et sa FAQ. Aident
 * Google à comprendre le produit et peuvent enrichir l'affichage du résultat.
 */
const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "fr-FR",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    inLanguage: "fr-FR",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.r },
    })),
  },
];

/* ------------------------------------------------------------------ */
/* Petits éléments réutilisés                                          */
/* ------------------------------------------------------------------ */

const h2 =
  "font-display text-[clamp(36px,4vw,56px)] leading-none font-extrabold uppercase";
/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/** Site vitrine affiché sur « / » aux visiteurs non connectés. */
export function LandingPage() {
  return (
    <VitrineShell>
      <script
        type="application/ld+json"
        // Contenu statique construit ci-dessus (pas de saisie utilisateur).
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
        }}
      />

      <main>
        {/* ============ HERO ============ */}
        <section className={cn(container, "flex flex-wrap items-center gap-14 pt-[72px] pb-[88px]")}>
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7">
            <div className="inline-flex items-center gap-2.5 self-start rounded-full bg-accent py-1.5 pr-3.5 pl-3 text-sm font-semibold text-accent-foreground">
              <span className="size-2.5 rounded-full bg-blaze" aria-hidden="true" />
              100 % gratuit · pour sociétés de chasse, ACCA et chasses privées
            </div>
            <h1 className="font-display text-[clamp(48px,6.4vw,84px)] leading-[0.96] font-extrabold tracking-[-0.01em] uppercase">
              Le cahier de battue numérique,
              <br />
              <span className="text-primary">enfin dans la poche.</span>
            </h1>
            <p className="max-w-[560px] text-xl leading-normal text-ink-soft">
              Participants, pointage signé au doigt, tableau de chasse, partage du gibier et
              cotisations&nbsp;: votre carnet de battue papier devient une appli de chasse qui
              fonctionne même sans réseau, au fond des bois.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/inscription" className={cn(ctaBlaze, "min-h-14 px-[26px] text-lg")}>
                Créer mon cahier gratuitement
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <a
                href="#jour-j"
                className="inline-flex min-h-14 items-center rounded-xl border border-input bg-card px-6 text-lg font-semibold hover:bg-muted"
              >
                Voir une journée type
              </a>
            </div>
            <ul className="flex flex-wrap gap-x-[22px] gap-y-2 text-[15px] font-medium text-ink-muted">
              {ARGUMENTS_HERO.map((a) => (
                <li key={a} className="inline-flex items-center gap-2">
                  <Check className="size-[18px] text-primary" strokeWidth={2.4} aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <PhoneMockup />
        </section>

        {/* ============ AVANT / APRÈS ============ */}
        <section className="border-y border-border bg-card">
          <div className={cn(container, "flex flex-wrap items-start gap-12 py-[72px]")}>
            <div className="min-w-0 flex-[1_1_360px]">
              <Eyebrow>Pourquoi passer au numérique</Eyebrow>
              <h2 className="font-display text-[clamp(36px,4vw,52px)] leading-none font-extrabold uppercase">
                Le carnet de battue papier a fait son temps.
              </h2>
            </div>
            <div className="grid min-w-0 flex-[2_1_560px] grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              <div className="rounded-2xl border border-border bg-background p-6">
                <p className="mb-3.5 text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">Avant</p>
                <ul className="flex flex-col gap-3 text-ink-soft">
                  {AVANT.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-primary bg-accent p-6">
                <p className="mb-3.5 text-sm font-bold tracking-[0.08em] text-accent-foreground uppercase">
                  Avec Cahier de battue
                </p>
                <ul className="flex flex-col gap-3 font-medium">
                  {APRES.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FONCTIONNALITÉS ============ */}
        <section id="fonctionnalites" className={cn(container, "scroll-mt-20 py-24")}>
          <div className="mb-12 max-w-[720px]">
            <Eyebrow>Fonctionnalités</Eyebrow>
            <h2 className={cn(h2, "mb-4")}>Tout le cahier de battue. Rien que le cahier.</h2>
            <p className="text-[19px] text-ink-soft">
              Chaque page de votre carnet de battue a son écran, pensé pour être utilisé debout,
              gants à la main, en plein soleil.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {FONCTIONNALITES.map(({ icon: Icon, titre, texte }) => (
              <article key={titre} className="flex flex-col gap-3.5 rounded-[18px] border border-border bg-card p-7">
                <span className="flex size-12 items-center justify-center rounded-xl bg-accent">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                </span>
                <h3 className="text-[21px] font-bold">{titre}</h3>
                <p className="text-ink-muted">{texte}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ============ LE JOUR J ============ */}
        <section id="jour-j" className="scroll-mt-20 border-y border-border bg-card">
          <div className={cn(container, "py-24")}>
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-[640px]">
                <Eyebrow>Une journée type</Eyebrow>
                <h2 className={h2}>Une battue, du rond de rendez-vous au partage du gibier.</h2>
              </div>
              <p className="max-w-[420px] text-ink-muted">
                Le responsable de battue suit la journée dans l&apos;ordre, sur un seul écran.
              </p>
            </div>
            <ol className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
              {ETAPES.map((e, i) => (
                <li key={e.titre} className="flex flex-col gap-3 border-t-4 border-blaze pt-5">
                  <span className="font-display text-[44px] leading-none font-extrabold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[21px] font-bold">{e.titre}</h3>
                  <p className="text-ink-muted">{e.texte}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ HORS-LIGNE ============ */}
        <section id="hors-ligne" className="scroll-mt-20 bg-forest text-white">
          <div className={cn(container, "flex flex-wrap items-center gap-14 py-24")}>
            <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-[22px]">
              <p className="text-sm font-bold tracking-[0.12em] text-blaze uppercase">Hors réseau</p>
              <h2 className="font-display text-[clamp(38px,4.4vw,60px)] leading-[0.98] font-extrabold uppercase">
                Pas de réseau au fond du bois&nbsp;? Votre carnet de chasse marche quand même.
              </h2>
              <p className="max-w-[520px] text-[19px] text-forest-soft">
                Ouvrez la battue avant de partir&nbsp;: tout est gardé sur le téléphone. Pointage,
                prélèvements, invités et partage continuent de fonctionner, puis se synchronisent
                tout seuls dès que le réseau revient.
              </p>
              <ul className="flex flex-col gap-3 font-medium">
                {[
                  "S'installe sur l'écran d'accueil comme une appli",
                  "Un badge indique ce qui reste à synchroniser",
                  "Contraste élevé, lisible en plein soleil",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-[22px] flex-none text-blaze" strokeWidth={2.4} aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0 flex-[1_1_380px]">
              <ol className="flex flex-col rounded-[20px] border border-white/15 bg-white/5 px-[22px]">
                {TIMELINE_SYNC.map(({ icon: Icon, titre, texte, ok }) => (
                  <li key={titre} className="flex items-center gap-3 border-b border-white/10 py-[18px] last:border-b-0">
                    <span
                      className={cn(
                        "flex size-11 flex-none items-center justify-center rounded-xl",
                        ok ? "bg-blaze text-foreground" : "bg-white/10 text-white",
                      )}
                    >
                      <Icon className="size-[22px]" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col leading-snug">
                      <span className="font-bold">{titre}</span>
                      <span className="text-sm text-forest-soft">{texte}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ============ FIN DE SAISON / EXPORTS ============ */}
        <section className={cn(container, "flex flex-wrap-reverse items-center gap-14 py-24")}>
          <div className="min-w-0 flex-[1_1_520px] rounded-[20px] border border-border bg-card p-2 shadow-[0_24px_48px_-28px_rgba(28,25,23,0.3)]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
              <span className="font-bold">Tableau de chasse · saison 2026/2027</span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-sm font-semibold text-accent-foreground">
                <FileSpreadsheet className="size-4" aria-hidden="true" />
                Exporter .xlsx
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-[15px]">
                <caption className="sr-only">Exemple de tableau de chasse exporté</caption>
                <thead>
                  <tr className="text-left text-[13px] tracking-[0.06em] text-muted-foreground uppercase">
                    {["Battue", "Espèce", "Bracelet", "Sexe", "Poids", "Tireur"].map((h) => (
                      <th key={h} scope="col" className="border-b border-border px-3.5 py-2.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRELEVEMENTS.map((p) => (
                    <tr key={p.bracelet} className="border-b border-muted last:border-b-0">
                      <td className="px-3.5 py-3">{p.battue}</td>
                      <td className="px-3.5 py-3 font-semibold">{p.espece}</td>
                      <td className="px-3.5 py-3">{p.bracelet}</td>
                      <td className="px-3.5 py-3">{p.sexe}</td>
                      <td className="px-3.5 py-3">{p.poids}</td>
                      <td className="px-3.5 py-3">{p.tireur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-5">
            <Eyebrow className="mb-0">Fin de saison</Eyebrow>
            <h2 className="font-display text-[clamp(36px,4vw,52px)] leading-none font-extrabold uppercase">
              Le bilan de la saison de chasse est déjà fait.
            </h2>
            <p className="text-[19px] text-ink-soft">
              Tableau de chasse, présences, cotisations, partage du gibier&nbsp;: tout est rangé au
              fil des battues. Exportez en Excel pour la fédération ou l&apos;assemblée générale, ou
              imprimez les feuilles pour l&apos;archive.
            </p>
            <p className="text-ink-muted">
              Une nouvelle saison reprend vos participants, espèces, morceaux et consignes&nbsp;:
              plus rien à ressaisir.
            </p>
          </div>
        </section>

        {/* ============ POUR QUI ============ */}
        <section className="border-y border-border bg-card">
          <div className={cn(container, "py-24")}>
            <Eyebrow>Pour qui</Eyebrow>
            <h2 className="mb-10 max-w-[760px] font-display text-[clamp(36px,4vw,52px)] leading-none font-extrabold uppercase">
              Président, trésorier, secrétaire&nbsp;: toute la société de chasse y gagne.
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              {ROLES.map((r) => (
                <div key={r.titre} className="flex flex-col gap-2 rounded-2xl bg-background p-6">
                  <h3 className="text-xl font-bold">{r.titre}</h3>
                  <p className="text-ink-muted">{r.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ GUIDES ============ */}
        <section className={cn(container, "py-24")}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[720px]">
              <Eyebrow>Guide</Eyebrow>
              <h2 className={h2}>Comment fonctionne le cahier de battue.</h2>
            </div>
            <Link href="/guide" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-foreground">
              Tout le guide
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {GUIDES.map(({ slug, court, description, icon: Icon }) => (
              <Link
                key={slug}
                href={`/guide/${slug}`}
                className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <span className="text-lg font-bold">{court}</span>
                <span className="text-[15px] text-ink-muted">{description}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ ARTICLES ============ */}
        <section className="border-y border-border bg-card">
          <div className={cn(container, "py-24")}>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-[720px]">
                <Eyebrow>Articles</Eyebrow>
                <h2 className={h2}>Bien organiser ses battues.</h2>
              </div>
              <Link href="/articles" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-foreground">
                Tous les articles
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
              {articlesRecents(ARTICLES)
                .slice(0, 3)
                .map((a) => (
                  <ArticleCard key={a.slug} article={a} className="bg-background" />
                ))}
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="mx-auto max-w-[880px] scroll-mt-20 px-6 py-24">
          <Eyebrow className="text-center">Questions fréquentes</Eyebrow>
          <h2 className="mb-10 text-center font-display text-[clamp(36px,4vw,52px)] leading-none font-extrabold uppercase">
            On vous répond.
          </h2>
          <div className="flex flex-col gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-[14px] border border-border bg-card px-[22px]">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="text-[26px] font-normal text-primary transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mb-5 text-ink-muted">{f.r}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ============ INSCRIPTION ============ */}
        <section id="inscription" className="scroll-mt-20 px-6 pb-24">
          <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-[22px] overflow-hidden rounded-[28px] bg-primary px-8 py-16 text-center text-primary-foreground">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-2.5 bg-[repeating-linear-gradient(-45deg,var(--color-blaze)_0_14px,var(--color-primary)_14px_28px)]"
            />
            <h2 className="max-w-[820px] font-display text-[clamp(40px,5vw,68px)] leading-[0.98] font-extrabold uppercase">
              Votre prochaine battue, sans le carnet papier.
            </h2>
            <p className="max-w-[560px] text-[19px] text-primary-soft">
              Gratuit, sans carte bancaire. Créez le cahier de votre société en quelques
              minutes&nbsp;: nom, territoire, saison, et c&apos;est parti.
            </p>
            {/* Envoie l'e-mail à /inscription, qui préremplit le formulaire. */}
            <form action="/inscription" method="get" className="mt-1.5 flex w-full max-w-[560px] flex-wrap justify-center gap-2.5">
              <label htmlFor="email-inscription" className="sr-only">
                Adresse e-mail
              </label>
              <input
                id="email-inscription"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="votre@email.fr"
                className="h-14 min-w-0 flex-[1_1_260px] rounded-xl border-0 bg-card px-[18px] text-[17px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blaze"
              />
              <button type="submit" className={cn(ctaBlaze, "h-14 cursor-pointer px-[26px] text-[17px]")}>
                Créer mon cahier gratuit
              </button>
            </form>
            <p className="text-[15px] text-primary-soft">
              Déjà inscrit&nbsp;?{" "}
              <Link href="/connexion" className="font-semibold text-white underline underline-offset-2">
                Se connecter
              </Link>
            </p>
          </div>
        </section>
      </main>

    </VitrineShell>
  );
}
