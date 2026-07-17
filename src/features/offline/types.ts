/** Types de transport pour la synchronisation d'une journée de battue. */

export type SyncPointage = {
  id: string;
  battueId: string;
  participantId: string;
  role: "POSTE" | "TRAQUEUR";
  cotisationChasse: boolean;
  cotisationChiens: boolean;
  signature: string | null;
  signedAt: string | null; // ISO
  updatedAt: string; // ISO
  deletedAt: string | null; // ISO
};

export type SyncInvite = {
  id: string;
  battueId: string;
  participantId: string;
  nom: string;
  prenom: string;
  numPermis: string | null;
  numValidation: string | null;
  numAssurance: string | null;
  role: "POSTE" | "TRAQUEUR";
  signature: string | null;
  updatedAt: string;
  deletedAt: string | null;
};

export type SyncPrelevement = {
  id: string;
  battueId: string;
  espece: string;
  numBracelet: string | null;
  age: string | null;
  sexe: "MALE" | "FEMELLE" | "INDETERMINE" | null;
  poids: string | null;
  tireurParticipantId: string | null;
  tireurInviteId: string | null;
  updatedAt: string;
  deletedAt: string | null;
};

export type SyncParticipant = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  numPermis: string | null;
  numValidation: string | null;
  numAssurance: string | null;
  nomAssurance: string | null;
  estChasseur: boolean;
  updatedAt: string; // ISO
};

export type SyncBattueMeta = {
  id: string;
  cahierId: string;
  date: string;
  lieu: string | null;
  heureDebut: string | null;
  heureFin: string | null;
  responsableId: string | null;
  especesJour: string[];
  signatureDelegant: string | null;
  signatureDelegue: string | null;
  updatedAt: string;
};

export type SyncCahierMeta = {
  id: string;
  nom: string;
  territoire: string;
  saison: string;
  especes: string[];
  reglesSecurite: string;
  /** Montants de cotisation par battue (euros). */
  cotisationChasse: number;
  cotisationChiens: number;
};

/** Instantané complet d'une journée (réponse GET et POST). */
export type BattueSnapshot = {
  battue: SyncBattueMeta;
  cahier: SyncCahierMeta;
  presidentId: string | null;
  participants: SyncParticipant[];
  pointages: SyncPointage[];
  invites: SyncInvite[];
  prelevements: SyncPrelevement[];
};

/** Corps de la requête de push (lignes modifiées localement). */
export type SyncPushBody = {
  delegation?: {
    signatureDelegant: string | null;
    signatureDelegue: string | null;
    updatedAt: string;
  };
  pointages: SyncPointage[];
  invites: SyncInvite[];
  prelevements: SyncPrelevement[];
  /** Fiches participant corrigées localement (permis, assurance, téléphone…). */
  participants?: SyncParticipant[];
};
