"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { prelevements } from "@/db/schema";
import { assertBattueOwned } from "@/features/battues/owner";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const schema = z.object({
  battueId: z.string().uuid(),
  espece: z.string().trim().min(1, "L'espèce est obligatoire."),
  numBracelet: z.preprocess(emptyToNull, z.string().trim().nullable()),
  age: z.preprocess(emptyToNull, z.string().trim().nullable()),
  sexe: z.preprocess(
    emptyToNull,
    z.enum(["MALE", "FEMELLE", "INDETERMINE"]).nullable(),
  ),
  poids: z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") return null;
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n.toFixed(2) : null;
  }, z.string().nullable()),
  // "p:<uuid>" | "i:<uuid>" | ""
  tireur: z.string().default(""),
});

function parseTireur(tireur: string): {
  tireurParticipantId: string | null;
  tireurInviteId: string | null;
} {
  if (tireur.startsWith("p:")) {
    return { tireurParticipantId: tireur.slice(2), tireurInviteId: null };
  }
  if (tireur.startsWith("i:")) {
    return { tireurParticipantId: null, tireurInviteId: tireur.slice(2) };
  }
  return { tireurParticipantId: null, tireurInviteId: null };
}

function parse(formData: FormData) {
  return schema.safeParse({
    battueId: formData.get("battueId"),
    espece: formData.get("espece"),
    numBracelet: formData.get("numBracelet"),
    age: formData.get("age"),
    sexe: formData.get("sexe"),
    poids: formData.get("poids"),
    tireur: formData.get("tireur") ?? "",
  });
}

export async function createPrelevement(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  const cahierId = await assertBattueOwned(d.battueId, user.id);
  if (!cahierId) return { error: "Accès refusé." };

  await db.insert(prelevements).values({
    battueId: d.battueId,
    espece: d.espece,
    numBracelet: d.numBracelet,
    age: d.age,
    sexe: d.sexe,
    poids: d.poids,
    ...parseTireur(d.tireur),
  });

  revalidatePath(`/cahiers/${cahierId}/battues/${d.battueId}/prelevements`);
  redirect(`/cahiers/${cahierId}/battues/${d.battueId}/prelevements`);
}

export async function updatePrelevement(
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
  const cahierId = await assertBattueOwned(d.battueId, user.id);
  if (!cahierId) return { error: "Accès refusé." };

  await db
    .update(prelevements)
    .set({
      espece: d.espece,
      numBracelet: d.numBracelet,
      age: d.age,
      sexe: d.sexe,
      poids: d.poids,
      ...parseTireur(d.tireur),
    })
    .where(
      and(eq(prelevements.id, id.data), eq(prelevements.battueId, d.battueId)),
    );

  revalidatePath(`/cahiers/${cahierId}/battues/${d.battueId}/prelevements`);
  redirect(`/cahiers/${cahierId}/battues/${d.battueId}/prelevements`);
}

export async function deletePrelevement(formData: FormData) {
  const user = await requireUser();
  const battueId = z.string().uuid().safeParse(formData.get("battueId"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!battueId.success || !id.success) return;
  const cahierId = await assertBattueOwned(battueId.data, user.id);
  if (!cahierId) return;

  await db
    .update(prelevements)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(prelevements.id, id.data),
        eq(prelevements.battueId, battueId.data),
      ),
    );

  revalidatePath(`/cahiers/${cahierId}/battues/${battueId.data}/prelevements`);
  redirect(`/cahiers/${cahierId}/battues/${battueId.data}/prelevements`);
}
