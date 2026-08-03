import "server-only";
import { alias } from "drizzle-orm/pg-core";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { participants, proprietaires } from "@/db/schema";

export type Proprietaire = typeof proprietaires.$inferSelect;

/** Liste les propriétaires d'un cahier (avec le nom du référent), triés par nom. */
export async function listProprietaires(cahierId: string) {
  const referent = alias(participants, "referent");
  return db
    .select({
      id: proprietaires.id,
      nom: proprietaires.nom,
      prenom: proprietaires.prenom,
      telephone: proprietaires.telephone,
      participantId: proprietaires.participantId,
      referentId: proprietaires.referentId,
      referentNom: referent.nom,
      referentPrenom: referent.prenom,
    })
    .from(proprietaires)
    .leftJoin(referent, eq(referent.id, proprietaires.referentId))
    .where(
      and(
        eq(proprietaires.cahierId, cahierId),
        isNull(proprietaires.deletedAt),
      ),
    )
    .orderBy(asc(proprietaires.nom), asc(proprietaires.prenom));
}

/** Récupère un propriétaire d'un cahier. */
export async function getProprietaire(cahierId: string, id: string) {
  const [row] = await db
    .select()
    .from(proprietaires)
    .where(
      and(
        eq(proprietaires.id, id),
        eq(proprietaires.cahierId, cahierId),
        isNull(proprietaires.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}
