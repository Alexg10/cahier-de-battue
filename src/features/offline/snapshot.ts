import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  battues,
  bureauMembres,
  cahiers,
  distributions,
  invites,
  participants,
  pointages,
  prelevements,
  proprietaires,
} from "@/db/schema";
import type { BattueSnapshot } from "./types";

const iso = (d: Date | null) => (d ? d.toISOString() : null);

/** Construit l'instantané synchronisable d'une journée de battue. */
export async function battueSnapshot(
  cahierId: string,
  battueId: string,
): Promise<BattueSnapshot | null> {
  const [battueRow] = await db
    .select()
    .from(battues)
    .where(
      and(
        eq(battues.id, battueId),
        eq(battues.cahierId, cahierId),
        isNull(battues.deletedAt),
      ),
    )
    .limit(1);
  if (!battueRow) return null;

  const [cahierRow] = await db
    .select()
    .from(cahiers)
    .where(eq(cahiers.id, cahierId))
    .limit(1);
  if (!cahierRow) return null;

  const [
    participantRows,
    presidentRow,
    pointageRows,
    inviteRows,
    prelevementRows,
    proprietaireRows,
    distributionRows,
  ] = await Promise.all([
      db
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.cahierId, cahierId),
            isNull(participants.deletedAt),
          ),
        )
        .orderBy(asc(participants.nom), asc(participants.prenom)),
      db
        .select({ participantId: bureauMembres.participantId })
        .from(bureauMembres)
        .where(
          and(
            eq(bureauMembres.cahierId, cahierId),
            eq(bureauMembres.role, "PRESIDENT"),
            isNull(bureauMembres.deletedAt),
          ),
        )
        .limit(1),
      db
        .select()
        .from(pointages)
        .where(
          and(eq(pointages.battueId, battueId), isNull(pointages.deletedAt)),
        ),
      db
        .select()
        .from(invites)
        .where(and(eq(invites.battueId, battueId), isNull(invites.deletedAt))),
      db
        .select()
        .from(prelevements)
        .where(
          and(
            eq(prelevements.battueId, battueId),
            isNull(prelevements.deletedAt),
          ),
        ),
      db
        .select()
        .from(proprietaires)
        .where(
          and(
            eq(proprietaires.cahierId, cahierId),
            isNull(proprietaires.deletedAt),
          ),
        )
        .orderBy(asc(proprietaires.nom), asc(proprietaires.prenom)),
      db
        .select()
        .from(distributions)
        .where(
          and(
            eq(distributions.battueId, battueId),
            isNull(distributions.deletedAt),
          ),
        ),
    ]);

  return {
    battue: {
      id: battueRow.id,
      cahierId: battueRow.cahierId,
      date: battueRow.date,
      lieu: battueRow.lieu,
      heureDebut: battueRow.heureDebut,
      heureFin: battueRow.heureFin,
      responsableId: battueRow.responsableId,
      especesJour: battueRow.especesJour,
      signatureDelegant: battueRow.signatureDelegant,
      signatureDelegue: battueRow.signatureDelegue,
      updatedAt: iso(battueRow.updatedAt)!,
    },
    cahier: {
      id: cahierRow.id,
      nom: cahierRow.nom,
      territoire: cahierRow.territoire,
      saison: cahierRow.saison,
      especes: cahierRow.especes,
      reglesSecurite: cahierRow.reglesSecurite,
      cotisationChasse: Number(cahierRow.cotisationChasse),
      cotisationChiens: Number(cahierRow.cotisationChiens),
      morceaux: cahierRow.morceaux,
    },
    presidentId: presidentRow[0]?.participantId ?? null,
    participants: participantRows.map((p) => ({
      id: p.id,
      nom: p.nom,
      prenom: p.prenom,
      telephone: p.telephone,
      numPermis: p.numPermis,
      numValidation: p.numValidation,
      numAssurance: p.numAssurance,
      nomAssurance: p.nomAssurance,
      estChasseur: p.estChasseur,
      updatedAt: p.updatedAt.toISOString(),
    })),
    pointages: pointageRows.map((p) => ({
      id: p.id,
      battueId: p.battueId,
      participantId: p.participantId,
      role: p.role,
      cotisationChasse: p.cotisationChasse,
      cotisationChiens: p.cotisationChiens,
      signature: p.signature,
      signedAt: iso(p.signedAt),
      updatedAt: iso(p.updatedAt)!,
      deletedAt: null,
    })),
    invites: inviteRows.map((i) => ({
      id: i.id,
      battueId: i.battueId,
      participantId: i.participantId,
      nom: i.nom,
      prenom: i.prenom,
      numPermis: i.numPermis,
      numValidation: i.numValidation,
      numAssurance: i.numAssurance,
      role: i.role,
      signature: i.signature,
      updatedAt: iso(i.updatedAt)!,
      deletedAt: null,
    })),
    prelevements: prelevementRows.map((p) => ({
      id: p.id,
      battueId: p.battueId,
      espece: p.espece,
      numBracelet: p.numBracelet,
      age: p.age,
      sexe: p.sexe,
      poids: p.poids,
      tireurParticipantId: p.tireurParticipantId,
      tireurInviteId: p.tireurInviteId,
      updatedAt: iso(p.updatedAt)!,
      deletedAt: null,
    })),
    proprietaires: proprietaireRows.map((p) => ({
      id: p.id,
      nom: p.nom,
      prenom: p.prenom,
      telephone: p.telephone,
    })),
    distributions: distributionRows.map((d) => ({
      id: d.id,
      battueId: d.battueId,
      recipientType: d.recipientType,
      recipientId: d.recipientId,
      morceau: d.morceau,
      updatedAt: iso(d.updatedAt)!,
      deletedAt: null,
    })),
  };
}
