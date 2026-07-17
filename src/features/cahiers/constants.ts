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

/** Calcule la saison de chasse courante, ex. "2025/2026" (bascule au 1er juin). */
export function saisonCourante(now = new Date()): string {
  const y = now.getFullYear();
  const debut = now.getMonth() >= 5 ? y : y - 1; // juin = mois 5
  return `${debut}/${debut + 1}`;
}
