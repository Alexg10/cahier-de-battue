"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { cahiers, participants, proprietaires } from "@/db/schema";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

async function assertOwned(cahierId: string, userId: string) {
  const [row] = await db
    .select({ id: cahiers.id })
    .from(cahiers)
    .where(and(eq(cahiers.id, cahierId), eq(cahiers.userId, userId)))
    .limit(1);
  return Boolean(row);
}

/** Vrai si le participant existe et appartient bien au cahier. */
async function participantInCahier(participantId: string, cahierId: string) {
  const [row] = await db
    .select({ id: participants.id })
    .from(participants)
    .where(
      and(
        eq(participants.id, participantId),
        eq(participants.cahierId, cahierId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

const proprietaireSchema = z.object({
  cahierId: z.string().uuid(),
  nom: z.string().trim().min(1, "Le nom est obligatoire."),
  prenom: z.string().trim().min(1, "Le prénom est obligatoire."),
  telephone: z.string().trim().optional().default(""),
  // Lien facultatif vers un participant chasseur (chaîne vide = non lié).
  participantId: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.string().uuid().nullable().default(null),
  ),
});

function parse(formData: FormData) {
  return proprietaireSchema.safeParse({
    cahierId: formData.get("cahierId"),
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    telephone: formData.get("telephone") ?? "",
    participantId: formData.get("participantId"),
  });
}

export async function createProprietaire(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  if (!(await assertOwned(parsed.data.cahierId, user.id))) {
    return { error: "Cahier introuvable." };
  }
  const d = parsed.data;
  if (
    d.participantId &&
    !(await participantInCahier(d.participantId, d.cahierId))
  ) {
    return { error: "Chasseur introuvable." };
  }
  await db.insert(proprietaires).values({
    cahierId: d.cahierId,
    nom: d.nom,
    prenom: d.prenom,
    telephone: d.telephone || null,
    participantId: d.participantId,
  });
  revalidatePath(`/cahiers/${d.cahierId}/proprietaires`);
  redirect(`/cahiers/${d.cahierId}/proprietaires`);
}

export async function updateProprietaire(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = parse(formData);
  if (!id.success || !parsed.success) {
    return {
      error:
        (!parsed.success && parsed.error.issues[0]?.message) ||
        "Formulaire invalide.",
    };
  }
  if (!(await assertOwned(parsed.data.cahierId, user.id))) {
    return { error: "Cahier introuvable." };
  }
  const d = parsed.data;
  if (
    d.participantId &&
    !(await participantInCahier(d.participantId, d.cahierId))
  ) {
    return { error: "Chasseur introuvable." };
  }
  await db
    .update(proprietaires)
    .set({
      nom: d.nom,
      prenom: d.prenom,
      telephone: d.telephone || null,
      participantId: d.participantId,
    })
    .where(
      and(
        eq(proprietaires.id, id.data),
        eq(proprietaires.cahierId, d.cahierId),
      ),
    );
  revalidatePath(`/cahiers/${d.cahierId}/proprietaires`);
  redirect(`/cahiers/${d.cahierId}/proprietaires`);
}

export async function deleteProprietaire(formData: FormData) {
  const user = await requireUser();
  const cahierId = z.string().uuid().safeParse(formData.get("cahierId"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!cahierId.success || !id.success) return;
  if (!(await assertOwned(cahierId.data, user.id))) return;

  await db
    .delete(proprietaires)
    .where(
      and(
        eq(proprietaires.id, id.data),
        eq(proprietaires.cahierId, cahierId.data),
      ),
    );
  revalidatePath(`/cahiers/${cahierId.data}/proprietaires`);
  redirect(`/cahiers/${cahierId.data}/proprietaires`);
}
