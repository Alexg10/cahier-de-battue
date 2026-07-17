"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { battues } from "@/db/schema";
import { assertCahierOwned } from "@/features/cahiers/owner";
import { getPresident } from "@/features/participants/queries";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const battueSchema = z.object({
  cahierId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
  lieu: z.preprocess(emptyToNull, z.string().trim().nullable()),
  heureDebut: z.preprocess(emptyToNull, z.string().nullable()),
  heureFin: z.preprocess(emptyToNull, z.string().nullable()),
  responsableId: z.preprocess(
    emptyToNull,
    z.string().uuid().nullable(),
  ),
});

function parse(formData: FormData) {
  return battueSchema.safeParse({
    cahierId: formData.get("cahierId"),
    date: formData.get("date"),
    lieu: formData.get("lieu"),
    heureDebut: formData.get("heureDebut"),
    heureFin: formData.get("heureFin"),
    responsableId: formData.get("responsableId"),
  });
}

export async function createBattue(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  if (!(await assertCahierOwned(d.cahierId, user.id))) {
    return { error: "Cahier introuvable." };
  }

  const especesJour = formData.getAll("especes").map(String).filter(Boolean);
  // Responsable par défaut : le président du cahier.
  const responsableId = d.responsableId ?? (await getPresident(d.cahierId));

  // N° figé = dernier + 1 dans le cahier (y compris battues supprimées, pour
  // ne jamais réutiliser un numéro).
  const [{ max }] = await db
    .select({
      max: sql<number>`coalesce(max(${battues.numero}), 0)`.mapWith(Number),
    })
    .from(battues)
    .where(eq(battues.cahierId, d.cahierId));

  const [created] = await db
    .insert(battues)
    .values({
      cahierId: d.cahierId,
      numero: max + 1,
      date: d.date,
      lieu: d.lieu,
      heureDebut: d.heureDebut,
      heureFin: d.heureFin,
      responsableId,
      especesJour,
    })
    .returning({ id: battues.id });

  revalidatePath(`/cahiers/${d.cahierId}/battues`);
  redirect(`/cahiers/${d.cahierId}/battues/${created.id}`);
}

export async function updateBattue(
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
  if (!(await assertCahierOwned(d.cahierId, user.id))) {
    return { error: "Cahier introuvable." };
  }
  const especesJour = formData.getAll("especes").map(String).filter(Boolean);

  await db
    .update(battues)
    .set({
      date: d.date,
      lieu: d.lieu,
      heureDebut: d.heureDebut,
      heureFin: d.heureFin,
      responsableId: d.responsableId,
      especesJour,
    })
    .where(and(eq(battues.id, id.data), eq(battues.cahierId, d.cahierId)));

  revalidatePath(`/cahiers/${d.cahierId}/battues/${id.data}`);
  redirect(`/cahiers/${d.cahierId}/battues/${id.data}`);
}

export async function deleteBattue(formData: FormData) {
  const user = await requireUser();
  const cahierId = z.string().uuid().safeParse(formData.get("cahierId"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!cahierId.success || !id.success) return;
  if (!(await assertCahierOwned(cahierId.data, user.id))) return;

  await db
    .update(battues)
    .set({ deletedAt: new Date() })
    .where(and(eq(battues.id, id.data), eq(battues.cahierId, cahierId.data)));

  revalidatePath(`/cahiers/${cahierId.data}/battues`);
  redirect(`/cahiers/${cahierId.data}/battues`);
}

/** Bascule l'état "clôturée" d'une battue. */
export async function toggleClotureBattue(formData: FormData) {
  const user = await requireUser();
  const cahierId = z.string().uuid().safeParse(formData.get("cahierId"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  const cloturee = formData.get("cloturee") === "true";
  if (!cahierId.success || !id.success) return;
  if (!(await assertCahierOwned(cahierId.data, user.id))) return;

  await db
    .update(battues)
    .set({ cloturee })
    .where(and(eq(battues.id, id.data), eq(battues.cahierId, cahierId.data)));

  revalidatePath(`/cahiers/${cahierId.data}/battues/${id.data}`);
}
