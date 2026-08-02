import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";

/** Métadonnées d'un plan (sans le contenu binaire). */
export type PlanMeta = {
  id: string;
  nom: string;
  mimeType: string;
  taille: number;
};

/** Liste les plans d'un cahier (métadonnées seules, pas le contenu). */
export async function listPlans(cahierId: string): Promise<PlanMeta[]> {
  return db
    .select({
      id: plans.id,
      nom: plans.nom,
      mimeType: plans.mimeType,
      taille: plans.taille,
    })
    .from(plans)
    .where(and(eq(plans.cahierId, cahierId), isNull(plans.deletedAt)))
    .orderBy(asc(plans.createdAt));
}

/** Récupère un plan (avec son contenu) en vérifiant son rattachement au cahier. */
export async function getPlan(cahierId: string, planId: string) {
  const [row] = await db
    .select({
      nom: plans.nom,
      mimeType: plans.mimeType,
      data: plans.data,
    })
    .from(plans)
    .where(
      and(
        eq(plans.id, planId),
        eq(plans.cahierId, cahierId),
        isNull(plans.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}
