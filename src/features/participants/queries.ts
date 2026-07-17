import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { bureauMembres, participants } from "@/db/schema";

export type Participant = typeof participants.$inferSelect;

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
