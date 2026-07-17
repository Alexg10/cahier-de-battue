import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { battues, cahiers } from "@/db/schema";

/**
 * Vérifie qu'une battue appartient à un cahier de l'utilisateur.
 * Renvoie le cahierId, ou null.
 */
export async function assertBattueOwned(battueId: string, userId: string) {
  const [row] = await db
    .select({ cahierId: battues.cahierId })
    .from(battues)
    .innerJoin(cahiers, eq(cahiers.id, battues.cahierId))
    .where(
      and(
        eq(battues.id, battueId),
        eq(cahiers.userId, userId),
        isNull(battues.deletedAt),
      ),
    )
    .limit(1);
  return row?.cahierId ?? null;
}
