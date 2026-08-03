import "server-only";
import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { bureauMembres, participants, proprietaires } from "@/db/schema";

export type Participant = typeof participants.$inferSelect;

/** Personne pouvant parrainer un participant (« invité par »). */
export type ParrainPersonne = { id: string; nom: string; prenom: string };

/**
 * Parrains possibles d'un participant : tous les (autres) participants et tous
 * les propriétaires, en deux groupes distincts. Les invités n'y figurent pas.
 */
export async function listParticipantParrains(
  cahierId: string,
  excludeId?: string,
): Promise<{ participants: ParrainPersonne[]; proprietaires: ParrainPersonne[] }> {
  const [parts, props] = await Promise.all([
    db
      .select({
        id: participants.id,
        nom: participants.nom,
        prenom: participants.prenom,
      })
      .from(participants)
      .where(
        and(
          eq(participants.cahierId, cahierId),
          isNull(participants.deletedAt),
          excludeId ? ne(participants.id, excludeId) : undefined,
        ),
      )
      .orderBy(asc(participants.nom), asc(participants.prenom)),
    db
      .select({
        id: proprietaires.id,
        nom: proprietaires.nom,
        prenom: proprietaires.prenom,
      })
      .from(proprietaires)
      .where(
        and(
          eq(proprietaires.cahierId, cahierId),
          isNull(proprietaires.deletedAt),
        ),
      )
      .orderBy(asc(proprietaires.nom), asc(proprietaires.prenom)),
  ]);
  return { participants: parts, proprietaires: props };
}

/** Liste les participants d'un cahier, triés par nom. */
export async function listParticipants(cahierId: string) {
  return db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.cahierId, cahierId),
        isNull(participants.deletedAt),
      ),
    )
    .orderBy(asc(participants.nom), asc(participants.prenom));
}

/** Récupère un participant d'un cahier. */
export async function getParticipant(cahierId: string, participantId: string) {
  const [row] = await db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.id, participantId),
        eq(participants.cahierId, cahierId),
        isNull(participants.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Attributions du bureau (role → participant) pour un cahier. */
export async function getBureau(cahierId: string) {
  return db
    .select({
      id: bureauMembres.id,
      role: bureauMembres.role,
      participantId: bureauMembres.participantId,
      nom: participants.nom,
      prenom: participants.prenom,
    })
    .from(bureauMembres)
    .innerJoin(
      participants,
      eq(participants.id, bureauMembres.participantId),
    )
    .where(
      and(
        eq(bureauMembres.cahierId, cahierId),
        isNull(bureauMembres.deletedAt),
      ),
    );
}

/** Renvoie le participant président du cahier, s'il existe. */
export async function getPresident(cahierId: string) {
  const [row] = await db
    .select({ participantId: bureauMembres.participantId })
    .from(bureauMembres)
    .where(
      and(
        eq(bureauMembres.cahierId, cahierId),
        eq(bureauMembres.role, "PRESIDENT"),
        isNull(bureauMembres.deletedAt),
      ),
    )
    .limit(1);
  return row?.participantId ?? null;
}
