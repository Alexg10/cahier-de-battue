import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  battues,
  distributions,
  invites,
  participants,
  pointages,
  prelevements,
} from "@/db/schema";
import type { SyncPushBody } from "./types";

const toDate = (s: string | null) => (s ? new Date(s) : null);

/**
 * Applique les modifications locales d'une journée (l'appareil fait foi).
 * Upsert simple par identité ; `deletedAt` non nul => suppression logique.
 */
export async function applyPush(
  battueId: string,
  cahierId: string,
  body: SyncPushBody,
) {
  // Délégation (signatures) sur la battue.
  if (body.delegation) {
    await db
      .update(battues)
      .set({
        signatureDelegant: body.delegation.signatureDelegant,
        signatureDelegue: body.delegation.signatureDelegue,
      })
      .where(eq(battues.id, battueId));
  }

  // Pointages : upsert par (battueId, participantId).
  for (const p of body.pointages) {
    if (p.battueId !== battueId) continue;
    await db
      .insert(pointages)
      .values({
        id: p.id,
        battueId,
        participantId: p.participantId,
        role: p.role,
        cotisationChasse: p.cotisationChasse,
        cotisationChiens: p.cotisationChiens,
        signature: p.signature,
        signedAt: toDate(p.signedAt),
        deletedAt: toDate(p.deletedAt),
      })
      .onConflictDoUpdate({
        target: [pointages.battueId, pointages.participantId],
        set: {
          role: p.role,
          cotisationChasse: p.cotisationChasse,
          cotisationChiens: p.cotisationChiens,
          signature: p.signature,
          signedAt: toDate(p.signedAt),
          deletedAt: toDate(p.deletedAt),
        },
      });
  }

  // Invités : upsert par id.
  for (const i of body.invites) {
    if (i.battueId !== battueId) continue;
    await db
      .insert(invites)
      .values({
        id: i.id,
        battueId,
        participantId: i.participantId,
        nom: i.nom,
        prenom: i.prenom,
        numPermis: i.numPermis,
        numValidation: i.numValidation,
        numAssurance: i.numAssurance,
        role: i.role,
        signature: i.signature,
        deletedAt: toDate(i.deletedAt),
      })
      .onConflictDoUpdate({
        target: [invites.id],
        set: {
          participantId: i.participantId,
          nom: i.nom,
          prenom: i.prenom,
          numPermis: i.numPermis,
          numValidation: i.numValidation,
          numAssurance: i.numAssurance,
          role: i.role,
          signature: i.signature,
          deletedAt: toDate(i.deletedAt),
        },
      });
  }

  // Participants : correction des infos (permis, assurance, téléphone…).
  // Mise à jour uniquement, scopée au cahier ; jamais de création ni suppression.
  for (const p of body.participants ?? []) {
    await db
      .update(participants)
      .set({
        telephone: p.telephone,
        numPermis: p.numPermis,
        numValidation: p.numValidation,
        numAssurance: p.numAssurance,
        nomAssurance: p.nomAssurance,
      })
      .where(
        and(eq(participants.id, p.id), eq(participants.cahierId, cahierId)),
      );
  }

  // Prélèvements : upsert par id.
  for (const p of body.prelevements) {
    if (p.battueId !== battueId) continue;
    await db
      .insert(prelevements)
      .values({
        id: p.id,
        battueId,
        espece: p.espece,
        numBracelet: p.numBracelet,
        age: p.age,
        sexe: p.sexe,
        poids: p.poids,
        tireurParticipantId: p.tireurParticipantId,
        tireurInviteId: p.tireurInviteId,
        deletedAt: toDate(p.deletedAt),
      })
      .onConflictDoUpdate({
        target: [prelevements.id],
        set: {
          espece: p.espece,
          numBracelet: p.numBracelet,
          age: p.age,
          sexe: p.sexe,
          poids: p.poids,
          tireurParticipantId: p.tireurParticipantId,
          tireurInviteId: p.tireurInviteId,
          deletedAt: toDate(p.deletedAt),
        },
      });
  }

  // Distributions : upsert par id.
  for (const d of body.distributions ?? []) {
    if (d.battueId !== battueId) continue;
    await db
      .insert(distributions)
      .values({
        id: d.id,
        battueId,
        recipientType: d.recipientType,
        recipientId: d.recipientId,
        morceau: d.morceau,
        deletedAt: toDate(d.deletedAt),
      })
      .onConflictDoUpdate({
        target: [distributions.id],
        set: {
          recipientType: d.recipientType,
          recipientId: d.recipientId,
          morceau: d.morceau,
          deletedAt: toDate(d.deletedAt),
        },
      });
  }
}
