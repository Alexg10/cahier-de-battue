"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { invites } from "@/db/schema";
import { assertBattueOwned } from "@/features/battues/owner";
import { requireUser } from "@/lib/session";

const inviteSchema = z.object({
  battueId: z.string().uuid(),
  participantId: z.string().uuid("Rattachez l'invité à un participant."),
  nom: z.string().trim().min(1, "Le nom est obligatoire."),
  prenom: z.string().trim().min(1, "Le prénom est obligatoire."),
  numPermis: z.string().trim().optional().default(""),
  numValidation: z.string().trim().optional().default(""),
  numAssurance: z.string().trim().optional().default(""),
  role: z.enum(["POSTE", "TRAQUEUR"]).default("POSTE"),
  signature: z
    .string()
    .startsWith("data:image/")
    .max(2_000_000)
    .optional()
    .nullable(),
});

export type InviteInput = z.input<typeof inviteSchema>;
export type ActionResult = { error?: string; ok?: boolean };

export async function createInvite(
  input: InviteInput,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  const cahierId = await assertBattueOwned(d.battueId, user.id);
  if (!cahierId) return { error: "Accès refusé." };

  await db.insert(invites).values({
    battueId: d.battueId,
    participantId: d.participantId,
    nom: d.nom,
    prenom: d.prenom,
    numPermis: d.numPermis || null,
    numValidation: d.numValidation || null,
    numAssurance: d.numAssurance || null,
    role: d.role,
    signature: d.signature ?? null,
  });

  revalidatePath(`/cahiers/${cahierId}/battues/${d.battueId}/invites`);
  return { ok: true };
}

export async function updateInvite(
  id: string,
  input: InviteInput,
): Promise<ActionResult> {
  const user = await requireUser();
  const inviteId = z.string().uuid().safeParse(id);
  const parsed = inviteSchema.safeParse(input);
  if (!inviteId.success || !parsed.success) {
    return {
      error:
        (!parsed.success && parsed.error.issues[0]?.message) ||
        "Formulaire invalide.",
    };
  }
  const d = parsed.data;
  const cahierId = await assertBattueOwned(d.battueId, user.id);
  if (!cahierId) return { error: "Accès refusé." };

  await db
    .update(invites)
    .set({
      participantId: d.participantId,
      nom: d.nom,
      prenom: d.prenom,
      numPermis: d.numPermis || null,
      numValidation: d.numValidation || null,
      numAssurance: d.numAssurance || null,
      role: d.role,
      ...(d.signature ? { signature: d.signature } : {}),
    })
    .where(
      and(eq(invites.id, inviteId.data), eq(invites.battueId, d.battueId)),
    );

  revalidatePath(`/cahiers/${cahierId}/battues/${d.battueId}/invites`);
  return { ok: true };
}

export async function deleteInvite(formData: FormData) {
  const user = await requireUser();
  const battueId = z.string().uuid().safeParse(formData.get("battueId"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!battueId.success || !id.success) return;
  const cahierId = await assertBattueOwned(battueId.data, user.id);
  if (!cahierId) return;

  await db
    .update(invites)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(invites.id, id.data), eq(invites.battueId, battueId.data)),
    );

  revalidatePath(`/cahiers/${cahierId}/battues/${battueId.data}/invites`);
}
