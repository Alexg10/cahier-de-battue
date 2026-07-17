/** Espèces proposées par défaut à la création d'un cahier (modifiables ensuite). */
export const ESPECES_PAR_DEFAUT = [
  "Chevreuil",
  "Cerf",
  "Sanglier",
  "Renard",
  "Lièvre",
  "Faisan",
  "Perdrix",
  "Blaireau",
  "Ragondin",
  "Pigeon",
] as const;

/** Un morceau de viande distribuable : libellé + code court pour le récap. */
export type Morceau = { label: string; code: string };

/** Morceaux proposés par défaut à la création d'un cahier (modifiables ensuite). */
export const MORCEAUX_PAR_DEFAUT: Morceau[] = [
  { label: "Gigot", code: "g" },
  { label: "Épaule", code: "e" },
  { label: "Gigot+côte", code: "gc" },
  { label: "Filet", code: "f" },
  { label: "Côtes", code: "C" },
  { label: "Rognons", code: "r" },
];

/** Calcule la saison de chasse courante, ex. "2025/2026" (bascule au 1er juin). */
export function saisonCourante(now = new Date()): string {
  const y = now.getFullYear();
  const debut = now.getMonth() >= 5 ? y : y - 1; // juin = mois 5
  return `${debut}/${debut + 1}`;
}
