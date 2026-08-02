import { auth } from "@/auth";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { getCahier } from "@/features/cahiers/queries";
import {
  MAX_PLAN_SIZE,
  PLAN_MIME_TYPES,
  formatTaille,
} from "@/features/plans/constants";

/** Upload d'un plan du territoire (un fichier JPG ou PDF par requête). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ cahierId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }
  const { cahierId } = await params;
  const cahier = await getCahier(cahierId, session.user.id);
  if (!cahier) return new Response("Introuvable", { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  if (!PLAN_MIME_TYPES.includes(file.type as (typeof PLAN_MIME_TYPES)[number])) {
    return Response.json(
      { error: "Format non supporté (JPG ou PDF uniquement)." },
      { status: 415 },
    );
  }
  if (file.size > MAX_PLAN_SIZE) {
    return Response.json(
      { error: `Fichier trop volumineux (max ${formatTaille(MAX_PLAN_SIZE)}).` },
      { status: 413 },
    );
  }

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const [created] = await db
    .insert(plans)
    .values({
      cahierId,
      nom: file.name || "Plan",
      mimeType: file.type,
      taille: file.size,
      data,
    })
    .returning({
      id: plans.id,
      nom: plans.nom,
      mimeType: plans.mimeType,
      taille: plans.taille,
    });

  return Response.json(created, { status: 201 });
}
