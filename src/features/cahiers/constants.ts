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

/** Code du « gigot tireur » attribué d'office au tireur (dérivé des prélèvements). */
export const GIGOT_TIREUR_CODE = "gT";

/** Morceaux proposés par défaut à la création d'un cahier (modifiables ensuite). */
export const MORCEAUX_PAR_DEFAUT: Morceau[] = [
  { label: "Gigot tireur", code: GIGOT_TIREUR_CODE },
  { label: "Gigot", code: "g" },
  { label: "Épaule", code: "e" },
  { label: "Filet", code: "f" },
  { label: "Côtes", code: "C" },
  { label: "Abats", code: "a" },
];

/** Calcule la saison de chasse courante, ex. "2025/2026" (bascule au 1er juin). */
export function saisonCourante(now = new Date()): string {
  const y = now.getFullYear();
  const debut = now.getMonth() >= 5 ? y : y - 1; // juin = mois 5
  return `${debut}/${debut + 1}`;
}

/**
 * Saison suivant une saison donnée, ex. "2025/2026" → "2026/2027".
 * Renvoie `null` si le format n'est pas reconnu.
 */
export function saisonSuivante(saison: string): string | null {
  const m = /^(\d{4})\/(\d{4})$/.exec(saison.trim());
  if (!m) return null;
  const debut = Number(m[1]) + 1;
  return `${debut}/${debut + 1}`;
}
