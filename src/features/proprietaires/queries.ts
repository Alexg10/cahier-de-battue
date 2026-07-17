import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { proprietaires } from "@/db/schema";

export type Proprietaire = typeof proprietaires.$inferSelect;

/** Liste les propriétaires d'un cahier, triés par nom. */
export async function listProprietaires(cahierId: string) {
  return db
    .select()
    .from(proprietaires)
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
