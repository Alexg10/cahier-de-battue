import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { participants, pointages } from "@/db/schema";

export type PointageRow = {
  participantId: string;
  role: "POSTE" | "TRAQUEUR";
  hasSignature: boolean;
};

/** Pointages d'une battue (participant → rôle + présence de signature). */
export async function listPointages(
  battueId: string,
): Promise<PointageRow[]> {
  const rows = await db
    .select({
      participantId: pointages.participantId,
      role: pointages.role,
      signature: pointages.signature,
    })
    .from(pointages)
    .where(
      and(eq(pointages.battueId, battueId), isNull(pointages.deletedAt)),
    );
  return rows.map((r) => ({
    participantId: r.participantId,
    role: r.role,
    hasSignature: Boolean(r.signature),
  }));
}

/** Pointages signés, avec nom du participant et image de signature (impression). */
export async function listPointagesDetailed(battueId: string) {
  return db
    .select({
      participantId: pointages.participantId,
      nom: participants.nom,
      prenom: participants.prenom,
      telephone: participants.telephone,
      numPermis: participants.numPermis,
      numValidation: participants.numValidation,
      numAssurance: participants.numAssurance,
      nomAssurance: participants.nomAssurance,
      role: pointages.role,
      cotisationChasse: pointages.cotisationChasse,
      cotisationChiens: pointages.cotisationChiens,
      signature: pointages.signature,
    })
    .from(pointages)
    .innerJoin(participants, eq(participants.id, pointages.participantId))
    .where(and(eq(pointages.battueId, battueId), isNull(pointages.deletedAt)))
    .orderBy(asc(participants.nom), asc(participants.prenom));
}
