import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invites, participants, prelevements } from "@/db/schema";

export type Prelevement = typeof prelevements.$inferSelect;

/** Liste les prélèvements d'une battue avec le nom du tireur (participant ou invité). */
export async function listPrelevements(battueId: string) {
  const rows = await db
    .select({
      prelevement: prelevements,
      participantNom: participants.nom,
      participantPrenom: participants.prenom,
      inviteNom: invites.nom,
      invitePrenom: invites.prenom,
    })
    .from(prelevements)
    .leftJoin(
      participants,
      eq(participants.id, prelevements.tireurParticipantId),
    )
    .leftJoin(invites, eq(invites.id, prelevements.tireurInviteId))
    .where(
      and(
        eq(prelevements.battueId, battueId),
        isNull(prelevements.deletedAt),
      ),
    )
    .orderBy(asc(prelevements.createdAt));

  return rows.map((r) => ({
    ...r.prelevement,
    tireurNom: r.participantPrenom
      ? `${r.participantPrenom} ${r.participantNom}`
      : r.invitePrenom
        ? `${r.invitePrenom} ${r.inviteNom} (invité)`
        : null,
  }));
}

/** Récupère un prélèvement. */
export async function getPrelevement(battueId: string, prelevementId: string) {
  const [row] = await db
    .select()
    .from(prelevements)
    .where(
      and(
        eq(prelevements.id, prelevementId),
        eq(prelevements.battueId, battueId),
        isNull(prelevements.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}
