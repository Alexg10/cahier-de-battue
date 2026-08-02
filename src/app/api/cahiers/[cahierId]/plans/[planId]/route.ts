import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { getCahier } from "@/features/cahiers/queries";
import { getPlan } from "@/features/plans/queries";

type Ctx = { params: Promise<{ cahierId: string; planId: string }> };

/** Sert le contenu d'un plan (affichage inline dans le navigateur). */
export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }
  const { cahierId, planId } = await params;
  const cahier = await getCahier(cahierId, session.user.id);
  if (!cahier) return new Response("Introuvable", { status: 404 });

  const plan = await getPlan(cahierId, planId);
  if (!plan) return new Response("Introuvable", { status: 404 });

  const bytes = Buffer.from(plan.data, "base64");
  // filename* encodé pour gérer les accents/espaces dans le nom d'origine.
  const filename = encodeURIComponent(plan.nom);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": plan.mimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

/** Supprime définitivement un plan. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }
  const { cahierId, planId } = await params;
  const cahier = await getCahier(cahierId, session.user.id);
  if (!cahier) return new Response("Introuvable", { status: 404 });

  await db
    .delete(plans)
    .where(and(eq(plans.id, planId), eq(plans.cahierId, cahierId)));

  return new Response(null, { status: 204 });
}
