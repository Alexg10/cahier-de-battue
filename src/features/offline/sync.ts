"use client";

import {
  getDB,
  participantKey,
  pointageKey,
  type LocalInvite,
  type LocalParticipant,
  type LocalPointage,
  type LocalPrelevement,
} from "./db";
import type {
  BattueSnapshot,
  SyncInvite,
  SyncParticipant,
  SyncPrelevement,
  SyncPushBody,
} from "./types";

const now = () => new Date().toISOString();
const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/* --------------------------- Hydratation locale --------------------------- */

/** Écrit un instantané serveur en local sans écraser les modifs non synchronisées. */
export async function mergeSnapshot(snap: BattueSnapshot) {
  const db = getDB();
  const battueId = snap.battue.id;

  await db.meta.put({
    battueId,
    battue: snap.battue,
    cahier: snap.cahier,
    presidentId: snap.presidentId,
    participants: snap.participants,
    pulledAt: now(),
  });

  // Pointages (clé par participant).
  const serverKeys = new Set(
    snap.pointages.map((p) => pointageKey(battueId, p.participantId)),
  );
  for (const p of snap.pointages) {
    const key = pointageKey(battueId, p.participantId);
    const local = await db.pointages.get(key);
    if (local?.dirty === 1) continue;
    await db.pointages.put({ ...p, key, dirty: 0 });
  }
  const localPointages = await db.pointages
    .where("battueId")
    .equals(battueId)
    .toArray();
  for (const lp of localPointages) {
    if (lp.dirty === 0 && !serverKeys.has(lp.key)) {
      await db.pointages.delete(lp.key);
    }
  }

  // Participants (clé par participant) : ne pas écraser une correction locale.
  const partServerKeys = new Set(
    snap.participants.map((p) => participantKey(battueId, p.id)),
  );
  for (const p of snap.participants) {
    const key = participantKey(battueId, p.id);
    const local = await db.participants.get(key);
    if (local?.dirty === 1) continue;
    await db.participants.put({ ...p, key, battueId, dirty: 0 });
  }
  const localParts = await db.participants
    .where("battueId")
    .equals(battueId)
    .toArray();
  for (const lp of localParts) {
    if (lp.dirty === 0 && !partServerKeys.has(lp.key)) {
      await db.participants.delete(lp.key);
    }
  }

  await mergeById(db.invites, battueId, snap.invites);
  await mergeById(db.prelevements, battueId, snap.prelevements);

  // Délégation.
  const localDeleg = await db.delegation.get(battueId);
  if (localDeleg?.dirty !== 1) {
    await db.delegation.put({
      battueId,
      signatureDelegant: snap.battue.signatureDelegant,
      signatureDelegue: snap.battue.signatureDelegue,
      updatedAt: snap.battue.updatedAt,
      dirty: 0,
    });
  }
}

async function mergeById<T extends { id: string; dirty: 0 | 1 }>(
  table: {
    get: (id: string) => Promise<T | undefined>;
    put: (row: T) => Promise<unknown>;
    delete: (id: string) => Promise<unknown>;
    where: (i: string) => { equals: (v: string) => { toArray: () => Promise<T[]> } };
  },
  battueId: string,
  serverRows: (SyncInvite | SyncPrelevement)[],
) {
  const serverIds = new Set(serverRows.map((r) => r.id));
  for (const r of serverRows) {
    const local = await table.get(r.id);
    if (local?.dirty === 1) continue;
    await table.put({ ...(r as object), dirty: 0 } as T);
  }
  const locals = await table.where("battueId").equals(battueId).toArray();
  for (const l of locals) {
    if (l.dirty === 0 && !serverIds.has(l.id)) await table.delete(l.id);
  }
}

/** Si aucune donnée locale pour cette battue, l'initialise depuis le serveur. */
export async function seedIfEmpty(snap: BattueSnapshot) {
  const db = getDB();
  const existing = await db.meta.get(snap.battue.id);
  if (!existing) {
    await mergeSnapshot(snap);
    return;
  }
  // La table participants est arrivée après coup (v2) : l'amorcer si vide pour
  // permettre l'édition hors-ligne même sur une battue déjà hydratée.
  const battueId = snap.battue.id;
  const count = await db.participants
    .where("battueId")
    .equals(battueId)
    .count();
  if (count === 0) {
    for (const p of snap.participants) {
      await db.participants.put({
        ...p,
        key: participantKey(battueId, p.id),
        battueId,
        dirty: 0,
      });
    }
  }
}

/* ------------------------------ Synchronisation --------------------------- */

function stripPointage(p: LocalPointage) {
  const { key: _key, dirty: _dirty, ...rest } = p;
  void _key;
  void _dirty;
  return rest;
}
function stripRow<T extends { dirty: 0 | 1 }>(r: T) {
  const { dirty: _dirty, ...rest } = r;
  void _dirty;
  return rest;
}

async function collectDirty(battueId: string): Promise<SyncPushBody | null> {
  const db = getDB();
  const [pts, invs, prels, parts, deleg] = await Promise.all([
    db.pointages.where("battueId").equals(battueId).toArray(),
    db.invites.where("battueId").equals(battueId).toArray(),
    db.prelevements.where("battueId").equals(battueId).toArray(),
    db.participants.where("battueId").equals(battueId).toArray(),
    db.delegation.get(battueId),
  ]);
  const dirtyPts = pts.filter((p) => p.dirty === 1);
  const dirtyInvs = invs.filter((i) => i.dirty === 1);
  const dirtyPrels = prels.filter((p) => p.dirty === 1);
  const dirtyParts = parts.filter((p) => p.dirty === 1);
  const dirtyDeleg = deleg?.dirty === 1 ? deleg : null;

  if (
    !dirtyPts.length &&
    !dirtyInvs.length &&
    !dirtyPrels.length &&
    !dirtyParts.length &&
    !dirtyDeleg
  ) {
    return null;
  }
  return {
    delegation: dirtyDeleg
      ? {
          signatureDelegant: dirtyDeleg.signatureDelegant,
          signatureDelegue: dirtyDeleg.signatureDelegue,
          updatedAt: dirtyDeleg.updatedAt,
        }
      : undefined,
    pointages: dirtyPts.map(stripPointage),
    invites: dirtyInvs.map(stripRow) as LocalInvite[],
    prelevements: dirtyPrels.map(stripRow) as LocalPrelevement[],
    participants: dirtyParts.map(stripParticipant),
  };
}

function stripParticipant(p: LocalParticipant): SyncParticipant {
  const { key: _key, battueId: _battueId, dirty: _dirty, ...rest } = p;
  void _key;
  void _battueId;
  void _dirty;
  return rest;
}

/** Synchronise une battue : push des modifs si besoin, sinon pull. */
export async function sync(battueId: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;
  const db = getDB();

  try {
    const body = await collectDirty(battueId);

    if (body) {
      // Mémoriser les updatedAt poussés pour ne nettoyer que l'inchangé.
      const pushedPts = new Map(
        body.pointages.map((p) => [
          pointageKey(battueId, p.participantId),
          p.updatedAt,
        ]),
      );
      const pushedInv = new Map(body.invites.map((i) => [i.id, i.updatedAt]));
      const pushedPrel = new Map(
        body.prelevements.map((p) => [p.id, p.updatedAt]),
      );
      const pushedPart = new Map(
        (body.participants ?? []).map((p) => [
          participantKey(battueId, p.id),
          p.updatedAt,
        ]),
      );
      const pushedDeleg = body.delegation?.updatedAt ?? null;

      const res = await fetch(`/api/sync/battue/${battueId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return false;
      const snap = (await res.json()) as BattueSnapshot;

      // Nettoyer le dirty des lignes inchangées depuis le push.
      for (const [key, up] of pushedPts) {
        const l = await db.pointages.get(key);
        if (l && l.updatedAt === up) await db.pointages.update(key, { dirty: 0 });
      }
      for (const [id, up] of pushedInv) {
        const l = await db.invites.get(id);
        if (l && l.updatedAt === up) await db.invites.update(id, { dirty: 0 });
      }
      for (const [id, up] of pushedPrel) {
        const l = await db.prelevements.get(id);
        if (l && l.updatedAt === up)
          await db.prelevements.update(id, { dirty: 0 });
      }
      for (const [key, up] of pushedPart) {
        const l = await db.participants.get(key);
        if (l && l.updatedAt === up)
          await db.participants.update(key, { dirty: 0 });
      }
      if (pushedDeleg) {
        const l = await db.delegation.get(battueId);
        if (l && l.updatedAt === pushedDeleg)
          await db.delegation.update(battueId, { dirty: 0 });
      }

      await mergeSnapshot(snap);
      return true;
    }

    // Rien à pousser : on tire l'état serveur.
    const res = await fetch(`/api/sync/battue/${battueId}`, {
      cache: "no-store",
    });
    if (!res.ok) return false;
    const snap = (await res.json()) as BattueSnapshot;
    await mergeSnapshot(snap);
    return true;
  } catch {
    return false;
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
/** Déclenche une synchro différée (best-effort). */
export function triggerSync(battueId: string) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void sync(battueId), 600);
}

/* -------------------------------- Mutations ------------------------------- */

export async function signPointage(
  battueId: string,
  participantId: string,
  signature: string,
  role: "POSTE" | "TRAQUEUR",
  cotisations?: { chasse: boolean; chiens: boolean },
) {
  const db = getDB();
  const key = pointageKey(battueId, participantId);
  const existing = await db.pointages.get(key);
  await db.pointages.put({
    key,
    id: existing?.id ?? uuid(),
    battueId,
    participantId,
    role,
    cotisationChasse: cotisations?.chasse ?? existing?.cotisationChasse ?? false,
    cotisationChiens: cotisations?.chiens ?? existing?.cotisationChiens ?? false,
    signature,
    signedAt: now(),
    updatedAt: now(),
    deletedAt: null,
    dirty: 1,
  });
  triggerSync(battueId);
}

export async function setPointageRole(
  battueId: string,
  participantId: string,
  role: "POSTE" | "TRAQUEUR",
) {
  const db = getDB();
  const key = pointageKey(battueId, participantId);
  const existing = await db.pointages.get(key);
  if (!existing) return;
  await db.pointages.update(key, { role, updatedAt: now(), dirty: 1 });
  triggerSync(battueId);
}

export async function setPointageCotisations(
  battueId: string,
  participantId: string,
  cotisations: { chasse: boolean; chiens: boolean },
) {
  const db = getDB();
  const key = pointageKey(battueId, participantId);
  const existing = await db.pointages.get(key);
  if (!existing) return;
  await db.pointages.update(key, {
    cotisationChasse: cotisations.chasse,
    cotisationChiens: cotisations.chiens,
    updatedAt: now(),
    dirty: 1,
  });
  triggerSync(battueId);
}

export async function removePointage(battueId: string, participantId: string) {
  const db = getDB();
  const key = pointageKey(battueId, participantId);
  await db.pointages.update(key, {
    deletedAt: now(),
    updatedAt: now(),
    dirty: 1,
  });
  triggerSync(battueId);
}

export type InviteInput = {
  id?: string;
  participantId: string;
  nom: string;
  prenom: string;
  numPermis: string | null;
  numValidation: string | null;
  numAssurance: string | null;
  role: "POSTE" | "TRAQUEUR";
  signature: string | null;
};

export async function upsertInvite(battueId: string, input: InviteInput) {
  const db = getDB();
  const id = input.id ?? uuid();
  await db.invites.put({
    id,
    battueId,
    participantId: input.participantId,
    nom: input.nom,
    prenom: input.prenom,
    numPermis: input.numPermis,
    numValidation: input.numValidation,
    numAssurance: input.numAssurance,
    role: input.role,
    signature: input.signature,
    updatedAt: now(),
    deletedAt: null,
    dirty: 1,
  });
  triggerSync(battueId);
  return id;
}

export async function removeInvite(battueId: string, id: string) {
  const db = getDB();
  await db.invites.update(id, { deletedAt: now(), updatedAt: now(), dirty: 1 });
  triggerSync(battueId);
}

export type PrelevementInput = {
  id?: string;
  espece: string;
  numBracelet: string | null;
  age: string | null;
  sexe: "MALE" | "FEMELLE" | "INDETERMINE" | null;
  poids: string | null;
  tireurParticipantId: string | null;
  tireurInviteId: string | null;
};

export async function upsertPrelevement(
  battueId: string,
  input: PrelevementInput,
) {
  const db = getDB();
  const id = input.id ?? uuid();
  await db.prelevements.put({
    id,
    battueId,
    espece: input.espece,
    numBracelet: input.numBracelet,
    age: input.age,
    sexe: input.sexe,
    poids: input.poids,
    tireurParticipantId: input.tireurParticipantId,
    tireurInviteId: input.tireurInviteId,
    updatedAt: now(),
    deletedAt: null,
    dirty: 1,
  });
  triggerSync(battueId);
  return id;
}

export async function removePrelevement(battueId: string, id: string) {
  const db = getDB();
  await db.prelevements.update(id, {
    deletedAt: now(),
    updatedAt: now(),
    dirty: 1,
  });
  triggerSync(battueId);
}

export type ParticipantInfoInput = {
  telephone: string | null;
  numPermis: string | null;
  numValidation: string | null;
  numAssurance: string | null;
  nomAssurance: string | null;
};

/** Corrige les infos d'un participant (permis, assurance, téléphone…) hors-ligne. */
export async function updateParticipantInfo(
  battueId: string,
  participantId: string,
  info: ParticipantInfoInput,
) {
  const db = getDB();
  const key = participantKey(battueId, participantId);
  const existing = await db.participants.get(key);
  if (!existing) return;
  await db.participants.update(key, {
    ...info,
    updatedAt: now(),
    dirty: 1,
  });
  triggerSync(battueId);
}

export async function saveDelegation(
  battueId: string,
  signatureDelegant: string | null,
  signatureDelegue: string | null,
) {
  const db = getDB();
  await db.delegation.put({
    battueId,
    signatureDelegant,
    signatureDelegue,
    updatedAt: now(),
    dirty: 1,
  });
  triggerSync(battueId);
}
