"use client";

import Dexie, { type Table } from "dexie";
import type {
  SyncBattueMeta,
  SyncCahierMeta,
  SyncInvite,
  SyncParticipant,
  SyncPointage,
  SyncPrelevement,
} from "./types";

export type LocalMeta = {
  battueId: string;
  battue: SyncBattueMeta;
  cahier: SyncCahierMeta;
  presidentId: string | null;
  participants: SyncParticipant[];
  pulledAt: string | null;
};

export type LocalPointage = SyncPointage & {
  /** Clé locale unique par participant : `${battueId}:${participantId}`. */
  key: string;
  dirty: 0 | 1;
};
export type LocalInvite = SyncInvite & { dirty: 0 | 1 };
export type LocalPrelevement = SyncPrelevement & { dirty: 0 | 1 };
export type LocalParticipant = SyncParticipant & {
  /** Clé locale unique par battue : `${battueId}:${id}`. */
  key: string;
  battueId: string;
  dirty: 0 | 1;
};
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
  invites!: Table<LocalInvite, string>;
  prelevements!: Table<LocalPrelevement, string>;
  delegation!: Table<LocalDelegation, string>;
  participants!: Table<LocalParticipant, string>;

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
