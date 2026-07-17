"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { battues } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { assertBattueOwned } from "./owner";

const signatureSchema = z
  .string()
  .startsWith("data:image/", "Signature invalide.")
  .max(2_000_000);

/** Enregistre les deux signatures de la délégation de pouvoir. */
export async function saveDelegation(input: {
  battueId: string;
  signatureDelegant: string;
  signatureDelegue: string;
}) {
  const user = await requireUser();
  const battueId = z.string().uuid().parse(input.battueId);
  const signatureDelegant = signatureSchema.parse(input.signatureDelegant);
  const signatureDelegue = signatureSchema.parse(input.signatureDelegue);

  const cahierId = await assertBattueOwned(battueId, user.id);
  if (!cahierId) return { error: "Accès refusé." };

  await db
    .update(battues)
    .set({ signatureDelegant, signatureDelegue })
    .where(eq(battues.id, battueId));

  revalidatePath(`/cahiers/${cahierId}/battues/${battueId}`);
  return { ok: true };
}

/** Efface la délégation (ex. retour au président comme responsable). */
export async function clearDelegation(battueId: string) {
  const user = await requireUser();
  const id = z.string().uuid().parse(battueId);
  const cahierId = await assertBattueOwned(id, user.id);
  if (!cahierId) return { error: "Accès refusé." };

  await db
    .update(battues)
    .set({ signatureDelegant: null, signatureDelegue: null })
    .where(eq(battues.id, id));

  revalidatePath(`/cahiers/${cahierId}/battues/${id}`);
  return { ok: true };
}
