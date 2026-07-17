"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { pointages } from "@/db/schema";
import { assertBattueOwned } from "@/features/battues/owner";
import { requireUser } from "@/lib/session";

const signatureSchema = z
  .string()
  .startsWith("data:image/", "Signature invalide.")
  .max(2_000_000);

const roleSchema = z.enum(["POSTE", "TRAQUEUR"]);

/** Enregistre (ou met à jour) le pointage signé d'un participant. */
export async function signPointage(input: {
  battueId: string;
  participantId: string;
  signature: string;
  role?: "POSTE" | "TRAQUEUR";
}) {
  const user = await requireUser();
  const battueId = z.string().uuid().parse(input.battueId);
  const participantId = z.string().uuid().parse(input.participantId);
  const signature = signatureSchema.parse(input.signature);
  const role = roleSchema.default("POSTE").parse(input.role ?? "POSTE");

  const cahierId = await assertBattueOwned(battueId, user.id);
  if (!cahierId) return { error: "Accès refusé." };

  await db
    .insert(pointages)
    .values({ battueId, participantId, signature, role, signedAt: new Date() })
    .onConflictDoUpdate({
      target: [pointages.battueId, pointages.participantId],
      set: { signature, role, signedAt: new Date(), deletedAt: null },
    });

  revalidatePath(`/cahiers/${cahierId}/battues/${battueId}`);
  return { ok: true };
}

/** Change le rôle (posté/traqueur) d'un pointage existant. */
export async function setPointageRole(input: {
  battueId: string;
  participantId: string;
  role: "POSTE" | "TRAQUEUR";
}) {
  const user = await requireUser();
  const battueId = z.string().uuid().parse(input.battueId);
  const participantId = z.string().uuid().parse(input.participantId);
  const role = roleSchema.parse(input.role);

  const cahierId = await assertBattueOwned(battueId, user.id);
  if (!cahierId) return { error: "Accès refusé." };

  await db
    .update(pointages)
    .set({ role })
    .where(
      and(
        eq(pointages.battueId, battueId),
        eq(pointages.participantId, participantId),
      ),
    );

  revalidatePath(`/cahiers/${cahierId}/battues/${battueId}`);
  return { ok: true };
}

/** Annule le pointage d'un participant (retire sa signature). */
export async function removePointage(input: {
  battueId: string;
  participantId: string;
}) {
  const user = await requireUser();
  const battueId = z.string().uuid().parse(input.battueId);
  const participantId = z.string().uuid().parse(input.participantId);

  const cahierId = await assertBattueOwned(battueId, user.id);
  if (!cahierId) return { error: "Accès refusé." };

  await db
    .delete(pointages)
    .where(
      and(
        eq(pointages.battueId, battueId),
        eq(pointages.participantId, participantId),
      ),
    );

  revalidatePath(`/cahiers/${cahierId}/battues/${battueId}`);
  return { ok: true };
}
