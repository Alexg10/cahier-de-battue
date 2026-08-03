"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { cahiers, invites, participants, proprietaires } from "@/db/schema";
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

/** Vérifie que le parrain (chasseur ou propriétaire) appartient bien au cahier. */
async function parrainValid(
  cahierId: string,
  type: "PARTICIPANT" | "PROPRIETAIRE",
  id: string,
) {
  if (type === "PARTICIPANT") {
    const [row] = await db
      .select({ id: participants.id })
      .from(participants)
      .where(and(eq(participants.id, id), eq(participants.cahierId, cahierId)))
      .limit(1);
    return Boolean(row);
  }
  const [row] = await db
    .select({ id: proprietaires.id })
    .from(proprietaires)
    .where(and(eq(proprietaires.id, id), eq(proprietaires.cahierId, cahierId)))
    .limit(1);
  return Boolean(row);
}

// Le parrain est transmis sous la forme "PARTICIPANT:<uuid>" ou "PROPRIETAIRE:<uuid>".
const parrain = z
  .string()
  .regex(
    /^(PARTICIPANT|PROPRIETAIRE):[0-9a-fA-F-]{36}$/,
    "Choisissez un parrain (chasseur ou propriétaire).",
  )
  .transform((s) => {
    const [type, id] = s.split(":");
    return { type: type as "PARTICIPANT" | "PROPRIETAIRE", id };
  });

const inviteSchema = z.object({
  cahierId: z.string().uuid(),
  parrain,
  nom: z.string().trim().min(1, "Le nom est obligatoire."),
  prenom: z.string().trim().min(1, "Le prénom est obligatoire."),
  numPermis: z.string().trim().optional().default(""),
  numValidation: z.string().trim().optional().default(""),
  numAssurance: z.string().trim().optional().default(""),
});

function parse(formData: FormData) {
  return inviteSchema.safeParse({
    cahierId: formData.get("cahierId"),
    parrain: formData.get("parrain"),
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    numPermis: formData.get("numPermis") ?? "",
    numValidation: formData.get("numValidation") ?? "",
    numAssurance: formData.get("numAssurance") ?? "",
  });
}

export async function createInvite(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  if (!(await assertOwned(d.cahierId, user.id))) {
    return { error: "Cahier introuvable." };
  }
  if (!(await parrainValid(d.cahierId, d.parrain.type, d.parrain.id))) {
    return { error: "Parrain introuvable." };
  }
  await db.insert(invites).values({
    cahierId: d.cahierId,
    parrainType: d.parrain.type,
    parrainId: d.parrain.id,
    nom: d.nom,
    prenom: d.prenom,
    numPermis: d.numPermis || null,
    numValidation: d.numValidation || null,
    numAssurance: d.numAssurance || null,
  });
  revalidatePath(`/cahiers/${d.cahierId}/invites`);
  redirect(`/cahiers/${d.cahierId}/invites`);
}

/**
 * Crée un invité sans redirection : appelé depuis une battue (dialog) pour
 * ajouter un nouvel invité au vol. Renvoie un résultat au lieu de rediriger.
 */
export async function createInviteQuick(input: {
  cahierId: string;
  parrain: string;
  nom: string;
  prenom: string;
  numPermis?: string;
  numValidation?: string;
  numAssurance?: string;
}): Promise<{ error?: string; ok?: boolean; id?: string }> {
  const user = await requireUser();
  const parsed = inviteSchema.safeParse({
    cahierId: input.cahierId,
    parrain: input.parrain,
    nom: input.nom,
    prenom: input.prenom,
    numPermis: input.numPermis ?? "",
    numValidation: input.numValidation ?? "",
    numAssurance: input.numAssurance ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  if (!(await assertOwned(d.cahierId, user.id))) {
    return { error: "Cahier introuvable." };
  }
  if (!(await parrainValid(d.cahierId, d.parrain.type, d.parrain.id))) {
    return { error: "Parrain introuvable." };
  }
  const [created] = await db
    .insert(invites)
    .values({
      cahierId: d.cahierId,
      parrainType: d.parrain.type,
      parrainId: d.parrain.id,
      nom: d.nom,
      prenom: d.prenom,
      numPermis: d.numPermis || null,
      numValidation: d.numValidation || null,
      numAssurance: d.numAssurance || null,
    })
    .returning({ id: invites.id });
  revalidatePath(`/cahiers/${d.cahierId}/invites`);
  return { ok: true, id: created.id };
}

export async function updateInvite(
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
  const d = parsed.data;
  if (!(await assertOwned(d.cahierId, user.id))) {
    return { error: "Cahier introuvable." };
  }
  if (!(await parrainValid(d.cahierId, d.parrain.type, d.parrain.id))) {
    return { error: "Parrain introuvable." };
  }
  await db
    .update(invites)
    .set({
      parrainType: d.parrain.type,
      parrainId: d.parrain.id,
      nom: d.nom,
      prenom: d.prenom,
      numPermis: d.numPermis || null,
      numValidation: d.numValidation || null,
      numAssurance: d.numAssurance || null,
    })
    .where(and(eq(invites.id, id.data), eq(invites.cahierId, d.cahierId)));
  revalidatePath(`/cahiers/${d.cahierId}/invites`);
  redirect(`/cahiers/${d.cahierId}/invites`);
}

export async function deleteInvite(formData: FormData) {
  const user = await requireUser();
  const cahierId = z.string().uuid().safeParse(formData.get("cahierId"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!cahierId.success || !id.success) return;
  if (!(await assertOwned(cahierId.data, user.id))) return;

  await db
    .update(invites)
    .set({ deletedAt: new Date() })
    .where(and(eq(invites.id, id.data), eq(invites.cahierId, cahierId.data)));
  revalidatePath(`/cahiers/${cahierId.data}/invites`);
  redirect(`/cahiers/${cahierId.data}/invites`);
}
