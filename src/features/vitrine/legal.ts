/**
 * Informations légales affichées dans les mentions légales et la politique de
 * confidentialité (obligations LCEN pour l'éditeur et l'hébergeur).
 */
export const LEGAL = {
  /**
   * Éditeur non professionnel : il peut rester anonyme sur le site
   * (LCEN, art. 6-III-2), son identité ayant été communiquée à l'hébergeur.
   */
  editeur: "un particulier",
  email: "guerard.dev@gmail.com",
  hebergeur: {
    nom: "Vercel Inc.",
    adresse: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    site: "https://vercel.com",
    /** Région d'exécution du serveur (réglage Vercel « Function Region »). */
    region: "Paris, France (cdg1)",
  },
  /** Bureau d'enregistrement du nom de domaine. */
  registrar: {
    nom: "OVH SAS",
    adresse: "2 rue Kellermann, 59100 Roubaix, France",
    site: "https://www.ovhcloud.com",
  },
  /** Base de données (données des cahiers). */
  hebergeurDonnees: {
    nom: "Neon (Databricks, Inc.)",
    site: "https://neon.com",
    /** Région du projet Neon (cf. hôte de DATABASE_URL). */
    region: "Union européenne (Francfort, AWS eu-central-1)",
  },
  /** Date de dernière mise à jour des pages légales. */
  miseAJour: "21 octobre 2026",
};
