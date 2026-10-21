/**
 * Informations légales affichées dans les mentions légales et la politique de
 * confidentialité. Tout champ « [À compléter …] » doit être renseigné avant la
 * mise en ligne (obligation LCEN pour l'éditeur et l'hébergeur).
 */
export const LEGAL = {
  /** Personne physique ou société qui édite le site. */
  editeur: "[À compléter : nom de l'éditeur ou raison sociale]",
  /** Pour une société : forme, capital, RCS / SIRET. Vide pour un particulier. */
  editeurStatut:
    "[À compléter : statut, ex. « Particulier » ou « SAS au capital de … – RCS … »]",
  adresse: "[À compléter : adresse postale]",
  email: "contact@cahierdebattue.fr",
  directeurPublication: "[À compléter : nom du directeur de la publication]",
  hebergeur: {
    nom: "[À compléter : hébergeur du site, ex. Vercel Inc.]",
    adresse: "[À compléter : adresse de l'hébergeur]",
    site: "[À compléter : site web de l'hébergeur]",
  },
  /** Base de données (données des cahiers). */
  hebergeurDonnees: {
    nom: "Neon (Databricks, Inc.)",
    site: "https://neon.com",
    /** Région du projet Neon (cf. hôte de DATABASE_URL). */
    region: "Union européenne (Francfort, AWS eu-central-1)",
    /** Hors Union européenne : transfert à mentionner (RGPD, chapitre V). */
    horsUE: false,
  },
  /** Date de dernière mise à jour des pages légales. */
  miseAJour: "21 octobre 2026",
};
