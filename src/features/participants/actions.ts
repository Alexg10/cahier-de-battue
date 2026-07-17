"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { bureauMembres, cahiers, participants } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { parseParticipantsFile } from "./import";

export type FormState = { error?: string } | undefined;
export type ImportState =
  | { error?: string; imported?: number }
  | undefined;

async function assertOwned(cahierId: string, userId: string) {
  const [row] = await db
    .select({ id: cahiers.id })
    .from(cahiers)
    .where(and(eq(cahiers.id, cahierId), eq(cahiers.userId, userId)))
    .limit(1);
  return Boolean(row);
}

const optText = z.string().trim().optional().default("");

const participantSchema = z.object({
  cahierId: z.string().uuid(),
  nom: z.string().trim().min(1, "Le nom est obligatoire."),
  prenom: z.string().trim().min(1, "Le prénom est obligatoire."),
  telephone: optText,
  email: optText,
  adresse: optText,
  dateNaissance: optText,
  lieuNaissance: optText,
  numPermis: optText,
  permisDelivreLe: optText,
  permisDelivreA: optText,
  numValidation: optText,
  typeValidation: z
    .union([
      z.enum(["DEPARTEMENTALE", "BI_DEPARTEMENTALE", "NATIONALE"]),
      z.literal(""),
    ])
    .default(""),
  timbreGrandGibier: z
    .union([z.enum(["NATIONAL", "DEPARTEMENTAL"]), z.literal("")])
    .default(""),
  nomAssurance: optText,
  adresseAssurance: optText,
  numAssurance: optText,
  estChasseur: z.coerce.boolean().default(true),
});

function parseParticipant(formData: FormData) {
  return participantSchema.safeParse({
    cahierId: formData.get("cahierId"),
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    telephone: formData.get("telephone") ?? "",
    email: formData.get("email") ?? "",
    adresse: formData.get("adresse") ?? "",
    dateNaissance: formData.get("dateNaissance") ?? "",
    lieuNaissance: formData.get("lieuNaissance") ?? "",
    numPermis: formData.get("numPermis") ?? "",
    permisDelivreLe: formData.get("permisDelivreLe") ?? "",
    permisDelivreA: formData.get("permisDelivreA") ?? "",
    numValidation: formData.get("numValidation") ?? "",
    typeValidation: formData.get("typeValidation") ?? "",
    timbreGrandGibier: formData.get("timbreGrandGibier") ?? "",
    nomAssurance: formData.get("nomAssurance") ?? "",
    adresseAssurance: formData.get("adresseAssurance") ?? "",
    numAssurance: formData.get("numAssurance") ?? "",
    // Checkbox : présente => "on"/"true" ; absente => null (non chasseur).
    estChasseur: formData.get("estChasseur") != null,
  });
}

/** Mappe les données validées vers les colonnes participant (insert/update). */
function toParticipantRow(d: z.infer<typeof participantSchema>) {
  return {
    nom: d.nom,
    prenom: d.prenom,
    telephone: d.telephone || null,
    email: d.email || null,
    adresse: d.adresse || null,
    dateNaissance: d.dateNaissance || null,
    lieuNaissance: d.lieuNaissance || null,
    numPermis: d.numPermis || null,
    permisDelivreLe: d.permisDelivreLe || null,
    permisDelivreA: d.permisDelivreA || null,
    numValidation: d.numValidation || null,
    typeValidation: d.typeValidation || null,
    timbreGrandGibier: d.timbreGrandGibier || null,
    nomAssurance: d.nomAssurance || null,
    adresseAssurance: d.adresseAssurance || null,
    numAssurance: d.numAssurance || null,
    estChasseur: d.estChasseur,
  };
}

export async function createParticipant(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseParticipant(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  if (!(await assertOwned(parsed.data.cahierId, user.id))) {
    return { error: "Cahier introuvable." };
  }
  const d = parsed.data;
  await db.insert(participants).values({
    cahierId: d.cahierId,
    ...toParticipantRow(d),
  });
  revalidatePath(`/cahiers/${d.cahierId}/participants`);
  redirect(`/cahiers/${d.cahierId}/participants`);
}

export async function updateParticipant(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = parseParticipant(formData);
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
  await db
    .update(participants)
    .set(toParticipantRow(d))
    .where(
      and(
        eq(participants.id, id.data),
        eq(participants.cahierId, d.cahierId),
      ),
    );
  revalidatePath(`/cahiers/${d.cahierId}/participants`);
  redirect(`/cahiers/${d.cahierId}/participants`);
}

/** Importe des participants depuis un CSV/Excel dans un cahier existant. */
export async function importParticipants(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const user = await requireUser();
  const cahierId = z.string().uuid().safeParse(formData.get("cahierId"));
  if (!cahierId.success) return { error: "Cahier invalide." };
  if (!(await assertOwned(cahierId.data, user.id))) {
    return { error: "Cahier introuvable." };
  }

  const file = formData.get("participantsFile");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Aucun fichier sélectionné." };
  }
  const res = await parseParticipantsFile(file);
  if (res.error) return { error: res.error };
  if (res.participants.length === 0) {
    return { error: "Aucun participant trouvé dans le fichier." };
  }

  await db.insert(participants).values(
    res.participants.map((p) => ({
      cahierId: cahierId.data,
      nom: p.nom,
      prenom: p.prenom,
      telephone: p.telephone,
      numPermis: p.numPermis,
      email: p.email,
      estChasseur: true,
    })),
  );
  revalidatePath(`/cahiers/${cahierId.data}/participants`);
  return { imported: res.participants.length };
}

export async function deleteParticipant(formData: FormData) {
  const user = await requireUser();
  const cahierId = z.string().uuid().safeParse(formData.get("cahierId"));
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!cahierId.success || !id.success) return;
  if (!(await assertOwned(cahierId.data, user.id))) return;

  // Tombstone (synchro offline). Les rôles de bureau associés sont retirés.
  await db
    .update(participants)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(participants.id, id.data),
        eq(participants.cahierId, cahierId.data),
      ),
    );
  await db
    .delete(bureauMembres)
    .where(
      and(
        eq(bureauMembres.cahierId, cahierId.data),
        eq(bureauMembres.participantId, id.data),
      ),
    );
  revalidatePath(`/cahiers/${cahierId.data}/participants`);
  redirect(`/cahiers/${cahierId.data}/participants`);
}

const bureauSchema = z.object({
  cahierId: z.string().uuid(),
  role: z.enum(["PRESIDENT", "TRESORIER", "SECRETAIRE"]),
  // "" => retirer l'attribution.
  participantId: z.union([z.string().uuid(), z.literal("")]),
});

export async function setBureauRole(formData: FormData) {
  const user = await requireUser();
  const parsed = bureauSchema.safeParse({
    cahierId: formData.get("cahierId"),
    role: formData.get("role"),
    participantId: formData.get("participantId") ?? "",
  });
  if (!parsed.success) return;
  if (!(await assertOwned(parsed.data.cahierId, user.id))) return;
  const { cahierId, role, participantId } = parsed.data;

  // Réattribution : on retire l'ancien titulaire du rôle, puis on ré-attribue.
  await db
    .delete(bureauMembres)
    .where(
      and(eq(bureauMembres.cahierId, cahierId), eq(bureauMembres.role, role)),
    );
  if (participantId) {
    await db.insert(bureauMembres).values({ cahierId, role, participantId });
  }
  revalidatePath(`/cahiers/${cahierId}/participants`);
  redirect(`/cahiers/${cahierId}/participants`);
}
