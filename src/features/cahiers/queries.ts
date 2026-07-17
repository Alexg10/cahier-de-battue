import "server-only";
import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  battues,
  cahiers,
  participants,
  pointages,
  prelevements,
} from "@/db/schema";

/** Liste les cahiers d'un utilisateur avec quelques compteurs. */
export async function listCahiers(userId: string) {
  return db
    .select({
      id: cahiers.id,
      nom: cahiers.nom,
      territoire: cahiers.territoire,
      saison: cahiers.saison,
      participantsCount: sql<number>`count(distinct ${participants.id})`.mapWith(
        Number,
      ),
      battuesCount: sql<number>`count(distinct ${battues.id})`.mapWith(Number),
    })
    .from(cahiers)
    .leftJoin(
      participants,
      and(
        eq(participants.cahierId, cahiers.id),
        isNull(participants.deletedAt),
      ),
    )
    .leftJoin(
      battues,
      and(eq(battues.cahierId, cahiers.id), isNull(battues.deletedAt)),
    )
    .where(and(eq(cahiers.userId, userId), isNull(cahiers.deletedAt)))
    .groupBy(cahiers.id)
    .orderBy(desc(cahiers.saison), desc(cahiers.createdAt));
}

/** Récapitulatif de la saison d'un cahier (compteurs + tableau de chasse). */
export async function saisonRecap(cahierId: string) {
  const [[battuesRow], [participantsRow], parEspece, [cotisRow], [cahierRow]] =
    await Promise.all([
      db
        .select({ n: count() })
        .from(battues)
        .where(and(eq(battues.cahierId, cahierId), isNull(battues.deletedAt))),
      db
        .select({ n: count() })
        .from(participants)
        .where(
          and(
            eq(participants.cahierId, cahierId),
            isNull(participants.deletedAt),
          ),
        ),
      db
        .select({ espece: prelevements.espece, n: count() })
        .from(prelevements)
        .innerJoin(battues, eq(battues.id, prelevements.battueId))
        .where(
          and(
            eq(battues.cahierId, cahierId),
            isNull(battues.deletedAt),
            isNull(prelevements.deletedAt),
          ),
        )
        .groupBy(prelevements.espece)
        .orderBy(desc(count())),
      // Cotisations cochées sur toute la saison (toutes battues confondues).
      db
        .select({
          chasse:
            sql<number>`count(*) filter (where ${pointages.cotisationChasse})`.mapWith(
              Number,
            ),
          chiens:
            sql<number>`count(*) filter (where ${pointages.cotisationChiens})`.mapWith(
              Number,
            ),
        })
        .from(pointages)
        .innerJoin(battues, eq(battues.id, pointages.battueId))
        .where(
          and(
            eq(battues.cahierId, cahierId),
            isNull(battues.deletedAt),
            isNull(pointages.deletedAt),
          ),
        ),
      db
        .select({
          chasse: cahiers.cotisationChasse,
          chiens: cahiers.cotisationChiens,
        })
        .from(cahiers)
        .where(eq(cahiers.id, cahierId)),
    ]);

  const prelevementsTotal = parEspece.reduce((s, e) => s + e.n, 0);
  const cotisationTotal =
    (cotisRow?.chasse ?? 0) * Number(cahierRow?.chasse ?? 0) +
    (cotisRow?.chiens ?? 0) * Number(cahierRow?.chiens ?? 0);
  return {
    battuesCount: battuesRow?.n ?? 0,
    participantsCount: participantsRow?.n ?? 0,
    prelevementsTotal,
    cotisationTotal,
    parEspece,
  };
}

/** Récupère un cahier en s'assurant qu'il appartient à l'utilisateur. */
export async function getCahier(cahierId: string, userId: string) {
  const [row] = await db
    .select()
    .from(cahiers)
    .where(
      and(
        eq(cahiers.id, cahierId),
        eq(cahiers.userId, userId),
        isNull(cahiers.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}
