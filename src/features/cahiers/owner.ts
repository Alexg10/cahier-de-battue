import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cahiers } from "@/db/schema";

/** Vrai si le cahier existe et appartient à l'utilisateur (usage server actions). */
export async function assertCahierOwned(cahierId: string, userId: string) {
  const [row] = await db
    .select({ id: cahiers.id })
    .from(cahiers)
    .where(and(eq(cahiers.id, cahierId), eq(cahiers.userId, userId)))
    .limit(1);
  return Boolean(row);
}
