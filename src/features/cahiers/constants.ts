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

/**
 * Espèces découpées en morceaux à la distribution (gigot, épaule…) proposées
 * par défaut (réglable par cahier). Les autres (pigeon, renard…) se
 * distribuent entières, sous le seul nom de l'espèce.
 */
export const ESPECES_DECOUPEES_PAR_DEFAUT = [
  "Chevreuil",
  "Cerf",
  "Sanglier",
] as const;

/** Code d'une distribution « animal entier » (espèce non découpée). */
export const ANIMAL_ENTIER_CODE = "entier";

const normaliser = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

/**
 * L'espèce fait-elle partie des espèces découpées du cahier ? (insensible
 * casse/accents)
 */
export function estEspeceDecoupee(
  espece: string,
  especesDecoupees: readonly string[],
): boolean {
  const e = normaliser(espece);
  return especesDecoupees.some((d) => normaliser(d) === e);
}

/**
 * Libellé d'une part distribuée : « Gigot Sanglier » pour une espèce découpée,
 * « Pigeon » pour un animal entier, le seul morceau si l'espèce est inconnue
 * (distributions antérieures à la précision de l'espèce).
 */
export function libellePart(
  morceau: string,
  espece: string | null,
  morceauLabel: (code: string) => string,
): string {
  if (morceau === ANIMAL_ENTIER_CODE) return espece ?? "Animal entier";
  const label = morceauLabel(morceau);
  return espece ? `${label} ${espece}` : label;
}

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
