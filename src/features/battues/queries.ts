import "server-only";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { battues, participants, pointages, prelevements } from "@/db/schema";

export type Battue = typeof battues.$inferSelect;

/** Liste les battues d'un cahier (pour le calendrier), avec compteurs. */
export async function listBattues(cahierId: string) {
  return db
    .select({
      id: battues.id,
      numero: battues.numero,
      date: battues.date,
      lieu: battues.lieu,
      cloturee: battues.cloturee,
      pointagesCount: sql<number>`count(distinct ${pointages.id})`.mapWith(
        Number,
      ),
      prelevementsCount:
        sql<number>`count(distinct ${prelevements.id})`.mapWith(Number),
      // Nombre de cotisations cochées (count distinct : robuste au produit
      // cartésien avec la jointure des prélèvements).
      cotisChasseCount: sql<number>`count(distinct case when ${pointages.cotisationChasse} then ${pointages.id} end)`.mapWith(
        Number,
      ),
      cotisChiensCount: sql<number>`count(distinct case when ${pointages.cotisationChiens} then ${pointages.id} end)`.mapWith(
        Number,
      ),
    })
    .from(battues)
    .leftJoin(pointages, eq(pointages.battueId, battues.id))
    .leftJoin(prelevements, eq(prelevements.battueId, battues.id))
    .where(and(eq(battues.cahierId, cahierId), isNull(battues.deletedAt)))
    .groupBy(battues.id)
    .orderBy(asc(battues.date));
}

/** Récupère une battue d'un cahier, avec le nom du responsable. */
export async function getBattue(cahierId: string, battueId: string) {
  const [row] = await db
    .select({
      battue: battues,
      responsableNom: participants.nom,
      responsablePrenom: participants.prenom,
    })
    .from(battues)
    .leftJoin(participants, eq(participants.id, battues.responsableId))
    .where(
      and(
        eq(battues.id, battueId),
        eq(battues.cahierId, cahierId),
        isNull(battues.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}
