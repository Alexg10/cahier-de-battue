"use client";

import Dexie, { type Table } from "dexie";
import type {
  SyncBattueMeta,
  SyncCahierMeta,
  SyncDistribution,
  SyncInviteParticipation,
  SyncInvitePerson,
  SyncParticipant,
  SyncPointage,
  SyncPrelevement,
  SyncProprietaire,
} from "./types";

export type LocalMeta = {
  battueId: string;
  battue: SyncBattueMeta;
  cahier: SyncCahierMeta;
  presidentId: string | null;
  participants: SyncParticipant[];
  proprietaires: SyncProprietaire[];
  /** Invités (personnes) du cahier, en lecture seule pour la sélection. */
  invitePersons: SyncInvitePerson[];
  pulledAt: string | null;
};

export type LocalPointage = SyncPointage & {
  /** Clé locale unique par participant : `${battueId}:${participantId}`. */
  key: string;
  dirty: 0 | 1;
};
export type LocalInviteParticipation = SyncInviteParticipation & {
  dirty: 0 | 1;
};
export type LocalPrelevement = SyncPrelevement & { dirty: 0 | 1 };
export type LocalParticipant = SyncParticipant & {
  /** Clé locale unique par battue : `${battueId}:${id}`. */
  key: string;
  battueId: string;
  dirty: 0 | 1;
};
export type LocalDistribution = SyncDistribution & { dirty: 0 | 1 };
export type LocalDelegation = {
  battueId: string;
  signatureDelegant: string | null;
  signatureDelegue: string | null;
  updatedAt: string;
  dirty: 0 | 1;
};

class BattueDB extends Dexie {
  meta!: Table<LocalMeta, string>;
  pointages!: Table<LocalPointage, string>;
  prelevements!: Table<LocalPrelevement, string>;
  delegation!: Table<LocalDelegation, string>;
  participants!: Table<LocalParticipant, string>;
  distributions!: Table<LocalDistribution, string>;
  inviteParticipations!: Table<LocalInviteParticipation, string>;

  constructor() {
    super("cahier-battue");
    this.version(1).stores({
      meta: "battueId",
      pointages: "key, battueId, dirty",
      invites: "id, battueId, dirty",
      prelevements: "id, battueId, dirty",
      delegation: "battueId, dirty",
    });
    // v2 : fiches participant éditables/synchronisables par battue.
    this.version(2).stores({
      participants: "key, battueId, dirty",
    });
    // v3 : distributions de gibier.
    this.version(3).stores({
      distributions: "id, battueId, dirty",
    });
    // v4 : les invités deviennent des personnes du cahier ; on ne synchronise
    // plus que leur participation par battue (l'ancienne table `invites` est
    // abandonnée).
    this.version(4).stores({
      invites: null,
      inviteParticipations: "id, battueId, dirty",
    });
  }
}

let _db: BattueDB | null = null;

/** Instance Dexie (lazy, côté navigateur uniquement). */
export function getDB(): BattueDB {
  if (!_db) _db = new BattueDB();
  return _db;
}

export const pointageKey = (battueId: string, participantId: string) =>
  `${battueId}:${participantId}`;

export const participantKey = (battueId: string, participantId: string) =>
  `${battueId}:${participantId}`;
