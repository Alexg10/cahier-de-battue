"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { cahiers, participants } from "@/db/schema";
import { parseParticipantsFile } from "@/features/participants/import";
import { requireUser } from "@/lib/session";
import { ESPECES_PAR_DEFAUT } from "./constants";

export type FormState = { error?: string } | undefined;

const cahierSchema = z.object({
  nom: z.string().trim().min(1, "Le nom de la société est obligatoire."),
  territoire: z.string().trim().default(""),
  saison: z
    .string()
    .trim()
    .regex(/^\d{4}\/\d{4}$/, "Format de saison attendu : 2025/2026."),
});

export async function createCahier(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = cahierSchema.safeParse({
    nom: formData.get("nom"),
    territoire: formData.get("territoire") ?? "",
    saison: formData.get("saison"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  // Import optionnel de participants (CSV/Excel) — analysé avant de créer le
  // cahier pour ne pas laisser un cahier vide en cas de fichier invalide.
  const file = formData.get("participantsFile");
  let aImporter: Awaited<ReturnType<typeof parseParticipantsFile>>["participants"] =
    [];
  if (file instanceof File && file.size > 0) {
    const res = await parseParticipantsFile(file);
    if (res.error) return { error: res.error };
    aImporter = res.participants;
  }

  const [created] = await db
    .insert(cahiers)
    .values({
      userId: user.id,
      nom: parsed.data.nom,
      territoire: parsed.data.territoire,
      saison: parsed.data.saison,
      especes: [...ESPECES_PAR_DEFAUT],
    })
    .returning({ id: cahiers.id });

  if (aImporter.length > 0) {
    await db.insert(participants).values(
      aImporter.map((p) => ({
        cahierId: created.id,
        nom: p.nom,
        prenom: p.prenom,
        telephone: p.telephone,
        numPermis: p.numPermis,
        email: p.email,
        estChasseur: true,
      })),
    );
  }

  revalidatePath("/");
  redirect(`/cahiers/${created.id}`);
}

// Montant euros : accepte "" (→ 0), la virgule décimale, borne à 2 décimales.
const montant = z
  .string()
  .trim()
  .default("")
  .transform((s) => s.replace(",", "."))
  .refine(
    (s) => s === "" || (Number.isFinite(Number(s)) && Number(s) >= 0),
    "Le montant doit être un nombre positif.",
  )
  .transform((s) => (s === "" ? "0.00" : Number(s).toFixed(2)));

const updateSchema = cahierSchema.extend({
  id: z.string().uuid(),
  especes: z.array(z.string().trim().min(1)).default([]),
  reglesSecurite: z.string().trim().default(""),
  cotisationChasse: montant,
  cotisationChiens: montant,
});

export async function updateCahier(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const especesRaw = formData.getAll("especes").map(String);
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    nom: formData.get("nom"),
    territoire: formData.get("territoire") ?? "",
    saison: formData.get("saison"),
    especes: especesRaw,
    reglesSecurite: formData.get("reglesSecurite") ?? "",
    cotisationChasse: formData.get("cotisationChasse") ?? "",
    cotisationChiens: formData.get("cotisationChiens") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  // Espèces : nettoyage (dédoublonnage, suppression des vides).
  const especes = Array.from(
    new Set(parsed.data.especes.map((e) => e.trim()).filter(Boolean)),
  );

  await db
    .update(cahiers)
    .set({
      nom: parsed.data.nom,
      territoire: parsed.data.territoire,
      saison: parsed.data.saison,
      especes,
      reglesSecurite: parsed.data.reglesSecurite,
      cotisationChasse: parsed.data.cotisationChasse,
      cotisationChiens: parsed.data.cotisationChiens,
    })
    .where(and(eq(cahiers.id, parsed.data.id), eq(cahiers.userId, user.id)));

  revalidatePath(`/cahiers/${parsed.data.id}`);
  redirect(`/cahiers/${parsed.data.id}`);
}

export async function deleteCahier(formData: FormData) {
  const user = await requireUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  // Suppression logique (tombstone) pour la synchro offline.
  await db
    .update(cahiers)
    .set({ deletedAt: new Date() })
    .where(and(eq(cahiers.id, id.data), eq(cahiers.userId, user.id)));

  revalidatePath("/");
  redirect("/");
}
