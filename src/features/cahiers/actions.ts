"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import {
  bureauMembres,
  cahiers,
  participants,
  proprietaires,
} from "@/db/schema";
import { parseParticipantsFile } from "@/features/participants/import";
import { getCahier } from "@/features/cahiers/queries";
import { requireUser } from "@/lib/session";
import {
  ESPECES_PAR_DEFAUT,
  MORCEAUX_PAR_DEFAUT,
  saisonSuivante,
} from "./constants";

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
      morceaux: MORCEAUX_PAR_DEFAUT,
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
        type: "CHASSEUR" as const,
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

// Liste des morceaux, transmise en JSON par le formulaire.
const morceaux = z.preprocess(
  (v) => {
    try {
      return JSON.parse(String(v ?? "[]"));
    } catch {
      return [];
    }
  },
  z
    .array(
      z.object({
        label: z.string().trim().min(1),
        code: z.string().trim().min(1),
      }),
    )
    .default([]),
);

const updateSchema = cahierSchema.extend({
  id: z.string().uuid(),
  especes: z.array(z.string().trim().min(1)).default([]),
  reglesSecurite: z.string().trim().default(""),
  cotisationChasse: montant,
  cotisationChiens: montant,
  morceaux,
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
    morceaux: formData.get("morceaux") ?? "[]",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  // Espèces : nettoyage (dédoublonnage, suppression des vides).
  const especes = Array.from(
    new Set(parsed.data.especes.map((e) => e.trim()).filter(Boolean)),
  );
  // Morceaux : dédoublonnage par code.
  const morceaux = parsed.data.morceaux.filter(
    (m, i, arr) => arr.findIndex((x) => x.code === m.code) === i,
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
      morceaux,
    })
    .where(and(eq(cahiers.id, parsed.data.id), eq(cahiers.userId, user.id)));

  revalidatePath(`/cahiers/${parsed.data.id}`);
  redirect(`/cahiers/${parsed.data.id}`);
}

/**
 * Duplique un cahier pour la saison suivante : reprend les réglages, les
 * participants, les propriétaires et le bureau, sans les battues (nouvelle
 * saison, tableau de chasse vierge). Les identifiants sont régénérés côté
 * serveur et les références (bureau → participant) remappées.
 */
export async function dupliquerSaison(formData: FormData) {
  const user = await requireUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  const source = await getCahier(id.data, user.id);
  if (!source) return; // 404 silencieux : pas le propriétaire, ou introuvable.

  const saison = saisonSuivante(source.saison);
  if (!saison) return;

  // Sous-ensembles vivants (on ignore les tombstones de la synchro offline).
  const [sourceParticipants, sourceProprietaires, sourceBureau] =
    await Promise.all([
      db
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.cahierId, source.id),
            isNull(participants.deletedAt),
          ),
        ),
      db
        .select()
        .from(proprietaires)
        .where(
          and(
            eq(proprietaires.cahierId, source.id),
            isNull(proprietaires.deletedAt),
          ),
        ),
      db
        .select()
        .from(bureauMembres)
        .where(
          and(
            eq(bureauMembres.cahierId, source.id),
            isNull(bureauMembres.deletedAt),
          ),
        ),
    ]);

  const nouveauCahierId = crypto.randomUUID();
  // Ancien id de participant → nouvel id, pour remapper le bureau.
  const participantIdMap = new Map(
    sourceParticipants.map((p) => [p.id, crypto.randomUUID()] as const),
  );

  const participantsValues = sourceParticipants.map((p) => ({
    id: participantIdMap.get(p.id)!,
    cahierId: nouveauCahierId,
    nom: p.nom,
    prenom: p.prenom,
    telephone: p.telephone,
    email: p.email,
    adresse: p.adresse,
    dateNaissance: p.dateNaissance,
    lieuNaissance: p.lieuNaissance,
    numPermis: p.numPermis,
    permisDelivreLe: p.permisDelivreLe,
    permisDelivreA: p.permisDelivreA,
    numValidation: p.numValidation,
    typeValidation: p.typeValidation,
    timbreGrandGibier: p.timbreGrandGibier,
    nomAssurance: p.nomAssurance,
    adresseAssurance: p.adresseAssurance,
    numAssurance: p.numAssurance,
    type: p.type,
    estChasseur: p.estChasseur,
  }));

  const proprietairesValues = sourceProprietaires.map((pr) => ({
    cahierId: nouveauCahierId,
    nom: pr.nom,
    prenom: pr.prenom,
    telephone: pr.telephone,
  }));

  const bureauValues = sourceBureau
    // On ne reprend que les rôles dont le titulaire a bien été recopié.
    .filter((b) => participantIdMap.has(b.participantId))
    .map((b) => ({
      cahierId: nouveauCahierId,
      role: b.role,
      participantId: participantIdMap.get(b.participantId)!,
    }));

  // Atomique via batch (le driver neon-http ne gère pas les transactions
  // interactives). L'ordre respecte les clés étrangères.
  type Op = Parameters<typeof db.batch>[0][number];
  const ops: Op[] = [
    db.insert(cahiers).values({
      id: nouveauCahierId,
      userId: user.id,
      nom: source.nom,
      territoire: source.territoire,
      saison,
      especes: source.especes,
      reglesSecurite: source.reglesSecurite,
      cotisationChasse: source.cotisationChasse,
      cotisationChiens: source.cotisationChiens,
      morceaux: source.morceaux,
    }),
  ];
  if (participantsValues.length)
    ops.push(db.insert(participants).values(participantsValues));
  if (proprietairesValues.length)
    ops.push(db.insert(proprietaires).values(proprietairesValues));
  if (bureauValues.length)
    ops.push(db.insert(bureauMembres).values(bureauValues));

  await db.batch(ops as [Op, ...Op[]]);

  revalidatePath("/");
  redirect(`/cahiers/${nouveauCahierId}`);
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
