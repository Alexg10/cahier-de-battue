import { pgEnum } from "drizzle-orm/pg-core";

/** Rôles du bureau, attribués par cahier de battue. */
export const bureauRoleEnum = pgEnum("bureau_role", [
  "PRESIDENT",
  "TRESORIER",
  "SECRETAIRE",
]);

/** Rôle d'un chasseur sur une journée de battue (posté par défaut). */
export const posteRoleEnum = pgEnum("poste_role", ["POSTE", "TRAQUEUR"]);

/** Sexe d'un animal prélevé. */
export const sexeEnum = pgEnum("sexe", ["MALE", "FEMELLE", "INDETERMINE"]);

/** Étendue de la validation du permis de chasser. */
export const validationTypeEnum = pgEnum("validation_type", [
  "DEPARTEMENTALE",
  "BI_DEPARTEMENTALE",
  "NATIONALE",
]);

/** Timbre grand gibier : national OU départemental (exclusif). */
export const timbreEnum = pgEnum("timbre_gg_type", ["NATIONAL", "DEPARTEMENTAL"]);

/** Type de bénéficiaire d'une distribution de gibier. */
export const distributionRecipientEnum = pgEnum("distribution_recipient", [
  "PARTICIPANT",
  "PROPRIETAIRE",
  "INVITE",
]);
