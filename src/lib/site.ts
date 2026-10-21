/** Identité publique du site (SEO, partages, données structurées). */

/** URL canonique du site. `NEXT_PUBLIC_SITE_URL` permet de la surcharger (préprod). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cahierdebattue.fr"
).replace(/\/$/, "");

export const SITE_NAME = "Cahier de battue";

/** Accroche courte, reprise par les partages et le manifeste. */
export const SITE_TAGLINE = "Le carnet de battue numérique et gratuit";

/** Description par défaut (≈ 155 caractères, affichée par Google). */
export const SITE_DESCRIPTION =
  "Carnet de battue numérique pour sociétés de chasse et ACCA : pointage signé, tableau de chasse, partage du gibier, cotisations. Gratuit, même sans réseau.";
