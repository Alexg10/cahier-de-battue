import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/features/export/print-button";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Modèle de carnet de battue à imprimer",
  description:
    "Feuille de carnet de battue vierge à imprimer ou enregistrer en PDF : informations du jour, consignes, pointage signé et tableau de chasse.",
  alternates: { canonical: "/modele-carnet-de-battue" },
};

/** Lignes vides du pointage et du tableau de chasse. */
const LIGNES_POINTAGE = 18;
const LIGNES_TABLEAU = 6;

const cell = "border border-black px-1.5 py-1 align-top";
const champ = "flex-1 border-b border-black";

function Champ({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`flex items-end gap-2 ${className ?? ""}`}>
      <span className="font-semibold whitespace-nowrap">{label}</span>
      <span className={champ}>&nbsp;</span>
    </div>
  );
}

/** Feuille de carnet de battue vierge, pensée pour l'impression (A4 paysage). */
export default function ModeleCarnetDeBattuePage() {
  return (
    <div className="mx-auto w-full max-w-5xl bg-white px-5 py-6 text-black print:max-w-none print:px-0 print:py-0">
      <style>
        {"@media print { @page { size: A4 landscape; margin: 10mm; } }"}
      </style>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/articles/modele-carnet-de-battue"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Retour à l&apos;article
        </Link>
        <PrintButton />
      </div>

      <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b-2 border-black pb-2">
        <h1 className="text-xl font-bold uppercase">Carnet de battue</h1>
        <span className="text-xs">
          Feuille n° ______ · Saison ______ / ______
        </span>
      </header>

      <section className="mb-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <Champ label="Société de chasse / ACCA" />
        <Champ label="Territoire" />
        <Champ label="Date" />
        <Champ label="Lieu / secteur" />
        <Champ label="Heure de début" />
        <Champ label="Heure de fin" />
        <Champ label="Responsable de battue" />
        <Champ label="Espèces chassées" />
      </section>

      <section className="mb-3 rounded border border-black p-2 text-xs">
        <p className="mb-1 font-bold">Consignes de sécurité rappelées</p>
        <p className="leading-relaxed">
          Gilet orange fluo obligatoire · Arme chargée uniquement au poste,
          après le signal · Angle de 30° avec les postes voisins · Tir fichant
          uniquement · Identifier l&apos;animal avant tout tir · Ne pas quitter
          son poste avant le signal de fin · Arme déchargée pour tout
          déplacement.
        </p>
        <div className="mt-1.5 flex gap-2">
          <span className="font-semibold">Consignes particulières :</span>
          <span className={champ}>&nbsp;</span>
        </div>
      </section>

      <section className="mb-3">
        <p className="mb-1 text-sm font-bold">
          Pointage des participants{" "}
          <span className="font-normal italic">
            — en signant, chacun reconnaît avoir pris connaissance des consignes
            de sécurité.
          </span>
        </p>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="text-left">
              <th className={`${cell} w-6`}>N°</th>
              <th className={cell}>Nom Prénom</th>
              <th className={cell}>N° permis</th>
              <th className={cell}>Validation</th>
              <th className={cell}>Assurance</th>
              <th className={`${cell} w-20`}>Rôle *</th>
              <th className={`${cell} w-16`}>Invité **</th>
              <th className={`${cell} w-40`}>Signature</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: LIGNES_POINTAGE }, (_, i) => (
              <tr key={i} className="h-7 break-inside-avoid">
                <td className={cell}>{i + 1}</td>
                {Array.from({ length: 7 }, (_, j) => (
                  <td key={j} className={cell} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-[10px]">
          * P = posté, T = traqueur, A = accompagnant · ** nom du parrain de
          l&apos;invité
        </p>
      </section>

      <section className="mb-3 break-inside-avoid">
        <p className="mb-1 text-sm font-bold">Tableau de chasse</p>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="text-left">
              <th className={cell}>Espèce</th>
              <th className={cell}>N° de bracelet</th>
              <th className={cell}>Sexe</th>
              <th className={cell}>Âge</th>
              <th className={cell}>Poids (kg)</th>
              <th className={cell}>Tireur</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: LIGNES_TABLEAU }, (_, i) => (
              <tr key={i} className="h-7">
                {Array.from({ length: 6 }, (_, j) => (
                  <td key={j} className={cell} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="flex flex-wrap items-end justify-between gap-4 text-xs">
        <div className="flex min-w-[260px] flex-1 items-end gap-2">
          <span className="font-semibold whitespace-nowrap">
            Signature du responsable :
          </span>
          <span className={`${champ} h-8`}>&nbsp;</span>
        </div>
        <span className="text-[10px] text-gray-600">
          Modèle gratuit — version numérique sur{" "}
          {SITE_URL.replace(/^https?:\/\//, "")}
        </span>
      </footer>
    </div>
  );
}
