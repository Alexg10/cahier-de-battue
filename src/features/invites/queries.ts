import "server-only";
import { alias } from "drizzle-orm/pg-core";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invites, participants } from "@/db/schema";

export type Invite = typeof invites.$inferSelect;

/** Liste les invités d'une battue, avec le nom du participant parrain. */
export async function listInvites(battueId: string) {
  const parrain = alias(participants, "parrain");
  return db
    .select({
      invite: invites,
      parrainNom: parrain.nom,
      parrainPrenom: parrain.prenom,
    })
    .from(invites)
    .leftJoin(parrain, eq(parrain.id, invites.participantId))
    .where(and(eq(invites.battueId, battueId), isNull(invites.deletedAt)))
    .orderBy(asc(invites.nom), asc(invites.prenom));
}

/** Récupère un invité. */
export async function getInvite(battueId: string, inviteId: string) {
  const [row] = await db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.id, inviteId),
        eq(invites.battueId, battueId),
        isNull(invites.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}
