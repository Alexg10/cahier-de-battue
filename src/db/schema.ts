import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  bureauRoleEnum,
  distributionRecipientEnum,
  posteRoleEnum,
  sexeEnum,
  timbreEnum,
  validationTypeEnum,
} from "./enums";
import type { Morceau } from "@/features/cahiers/constants";

// Les enums doivent être ré-exportés depuis le schéma, sinon drizzle-kit
// n'émet pas les `CREATE TYPE` correspondants.
export * from "./enums";

/**
 * Colonnes de suivi communes, pensées pour la synchronisation offline-first :
 * - `createdAt` / `updatedAt` : LWW (last-write-wins) à la synchro
 * - `deletedAt` : tombstone pour propager les suppressions au pull
 * Les identifiants sont des UUID pouvant être générés côté client (hors-ligne).
 */
const tracking = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

/** Compte de connexion (le gérant). */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/** Un cahier de battue = une société de chasse pour une saison donnée. */
export const cahiers = pgTable("cahiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Nom de la société de chasse. */
  nom: text("nom").notNull(),
  /** Nom du territoire de chasse (utilisé dans la délégation et les exports). */
  territoire: text("territoire").notNull().default(""),
  /** Saison, ex. "2025/2026". */
  saison: text("saison").notNull(),
  /** Liste des espèces chassables de ce cahier (modifiable). */
  especes: text("especes")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  /** Règles d'organisation et consignes de sécurité de la chasse. */
  reglesSecurite: text("regles_securite").notNull().default(""),
  /** Montant de la cotisation « chasse » par battue (euros). */
  cotisationChasse: numeric("cotisation_chasse", { precision: 8, scale: 2 })
    .notNull()
    .default("0"),
  /** Montant de la cotisation « chiens » par battue (euros). */
  cotisationChiens: numeric("cotisation_chiens", { precision: 8, scale: 2 })
    .notNull()
    .default("0"),
  /** Morceaux distribuables (libellé + code court), éditables. */
  morceaux: jsonb("morceaux")
    .$type<Morceau[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  ...tracking,
});

/**
 * Plan du territoire : fichier (JPG ou PDF) rattaché à un cahier. Le contenu
 * binaire est stocké en base64 dans `data` ; on ne le lit qu'au moment de servir
 * le fichier (la liste ne sélectionne que les métadonnées).
 */
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  cahierId: uuid("cahier_id")
    .notNull()
    .references(() => cahiers.id, { onDelete: "cascade" }),
  /** Nom affiché (nom du fichier d'origine). */
  nom: text("nom").notNull(),
  /** Type MIME : image/jpeg ou application/pdf. */
  mimeType: text("mime_type").notNull(),
  /** Taille en octets (indicatif, pour l'affichage). */
  taille: integer("taille").notNull().default(0),
  /** Contenu du fichier encodé en base64 (sans préfixe data:). */
  data: text("data").notNull(),
  ...tracking,
});

/** Participants : personnes rattachées à un cahier (chasseurs ou non). */
export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  cahierId: uuid("cahier_id")
    .notNull()
    .references(() => cahiers.id, { onDelete: "cascade" }),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  telephone: text("telephone"),
  /** E-mail du chasseur. */
  email: text("email"),
  /** Adresse postale du chasseur. */
  adresse: text("adresse"),
  /** Date de naissance. */
  dateNaissance: date("date_naissance"),
  /** Lieu de naissance. */
  lieuNaissance: text("lieu_naissance"),
  /** N° du permis de chasser. */
  numPermis: text("num_permis"),
  /** Date de délivrance du permis. */
  permisDelivreLe: date("permis_delivre_le"),
  /** Lieu de délivrance du permis. */
  permisDelivreA: text("permis_delivre_a"),
  /** N° de validation annuelle du permis. */
  numValidation: text("num_validation"),
  /** Étendue de la validation (départementale / bi / nationale). */
  typeValidation: validationTypeEnum("type_validation"),
  /** Timbre grand gibier : national OU départemental (exclusif), ou aucun. */
  timbreGrandGibier: timbreEnum("timbre_gg"),
  /** Nom de la compagnie d'assurance. */
  nomAssurance: text("nom_assurance"),
  /** Adresse de l'agent ou du courtier d'assurance. */
  adresseAssurance: text("adresse_assurance"),
  /** N° d'assurance annuelle. */
  numAssurance: text("num_assurance"),
  /** Faux = membre du bureau non chasseur (ex. secrétaire). */
  estChasseur: boolean("est_chasseur").notNull().default(true),
  ...tracking,
});

/** Propriétaire foncier rattaché à un cahier (contact simple). */
export const proprietaires = pgTable("proprietaires", {
  id: uuid("id").primaryKey().defaultRandom(),
  cahierId: uuid("cahier_id")
    .notNull()
    .references(() => cahiers.id, { onDelete: "cascade" }),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  telephone: text("telephone"),
  ...tracking,
});

/** Attribution des rôles du bureau, par cahier (un rôle = une personne). */
export const bureauMembres = pgTable(
  "bureau_membres",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cahierId: uuid("cahier_id")
      .notNull()
      .references(() => cahiers.id, { onDelete: "cascade" }),
    role: bureauRoleEnum("role").notNull(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    ...tracking,
  },
  (t) => [unique("bureau_role_unique").on(t.cahierId, t.role)],
);

/** Journée de battue. */
export const battues = pgTable(
  "battues",
  {
  id: uuid("id").primaryKey().defaultRandom(),
  cahierId: uuid("cahier_id")
    .notNull()
    .references(() => cahiers.id, { onDelete: "cascade" }),
  /** N° lisible de la battue dans le cahier (figé à la création, commence à 1). */
  numero: integer("numero").notNull(),
  date: date("date").notNull(),
  lieu: text("lieu"),
  heureDebut: time("heure_debut"),
  heureFin: time("heure_fin"),
  /** Responsable de battue (par défaut le président du cahier). */
  responsableId: uuid("responsable_id").references(() => participants.id, {
    onDelete: "set null",
  }),
  /** Espèces chassées ce jour. */
  especesJour: text("especes_jour")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  /** Délégation de pouvoir (si responsable ≠ président) : signatures data-URL. */
  signatureDelegant: text("signature_delegant"),
  signatureDelegue: text("signature_delegue"),
  cloturee: boolean("cloturee").notNull().default(false),
  ...tracking,
  },
  (t) => [unique("battue_numero_unique").on(t.cahierId, t.numero)],
);

/** Pointage : un chasseur signe le carnet du jour (présence + rôle). */
export const pointages = pgTable(
  "pointages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battueId: uuid("battue_id")
      .notNull()
      .references(() => battues.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    role: posteRoleEnum("role").notNull().default("POSTE"),
    /** Cotisation « chasse » versée par le signataire pour cette battue. */
    cotisationChasse: boolean("cotisation_chasse").notNull().default(false),
    /** Cotisation « chiens » versée par le signataire pour cette battue. */
    cotisationChiens: boolean("cotisation_chiens").notNull().default(false),
    /** Signature manuscrite (data-URL PNG). */
    signature: text("signature"),
    signedAt: timestamp("signed_at", { withTimezone: true }),
    ...tracking,
  },
  (t) => [unique("pointage_unique").on(t.battueId, t.participantId)],
);

/** Invité/accompagnateur ponctuel sur une battue, rattaché à un participant. */
export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  battueId: uuid("battue_id")
    .notNull()
    .references(() => battues.id, { onDelete: "cascade" }),
  /** Participant (membre) qui invite/parraine. */
  participantId: uuid("participant_id")
    .notNull()
    .references(() => participants.id, { onDelete: "cascade" }),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  numPermis: text("num_permis"),
  numValidation: text("num_validation"),
  /** N° de contrat d'assurance. */
  numAssurance: text("num_assurance"),
  role: posteRoleEnum("role").notNull().default("POSTE"),
  signature: text("signature"),
  ...tracking,
});

/** Animal prélevé pendant la battue (tableau de chasse). */
export const prelevements = pgTable("prelevements", {
  id: uuid("id").primaryKey().defaultRandom(),
  battueId: uuid("battue_id")
    .notNull()
    .references(() => battues.id, { onDelete: "cascade" }),
  espece: text("espece").notNull(),
  numBracelet: text("num_bracelet"),
  age: text("age"),
  sexe: sexeEnum("sexe"),
  poids: numeric("poids", { precision: 6, scale: 2 }),
  /** Tireur : soit un participant, soit un invité (exactement l'un des deux). */
  tireurParticipantId: uuid("tireur_participant_id").references(
    () => participants.id,
    { onDelete: "set null" },
  ),
  tireurInviteId: uuid("tireur_invite_id").references(() => invites.id, {
    onDelete: "set null",
  }),
  ...tracking,
});

/**
 * Attribution manuelle d'un morceau de gibier à un bénéficiaire, sur une battue.
 * Bénéficiaire polymorphe (participant / propriétaire / invité). Le gigot
 * attribué d'office au tireur est dérivé des prélèvements, pas stocké ici.
 */
export const distributions = pgTable("distributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  battueId: uuid("battue_id")
    .notNull()
    .references(() => battues.id, { onDelete: "cascade" }),
  recipientType: distributionRecipientEnum("recipient_type").notNull(),
  recipientId: uuid("recipient_id").notNull(),
  /** Code du morceau (référence la liste `morceaux` du cahier). */
  morceau: text("morceau").notNull(),
  ...tracking,
});
