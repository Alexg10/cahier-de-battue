/** Taille maximale d'un plan uploadé (10 Mo), pour éviter des fichiers trop gros. */
export const MAX_PLAN_SIZE = 10 * 1024 * 1024;

/** Types de fichiers acceptés pour un plan du territoire. */
export const PLAN_MIME_TYPES = ["image/jpeg", "application/pdf"] as const;

/** Attribut `accept` pour l'input fichier. */
export const PLAN_ACCEPT = ".jpg,.jpeg,.pdf,image/jpeg,application/pdf";

/** Vrai si le type MIME correspond à une image (sinon PDF). */
export const estImage = (mimeType: string) => mimeType.startsWith("image/");

/** Formate une taille en octets de façon lisible (ex. « 2,3 Mo »). */
export function formatTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024)
    return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
