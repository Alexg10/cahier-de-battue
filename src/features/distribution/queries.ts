import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  battues,
  cahiers,
  distributions,
  invites,
  participants,
  prelevements,
  proprietaires,
} from "@/db/schema";
import {
  ANIMAL_ENTIER_CODE,
  GIGOT_TIREUR_CODE,
  estEspeceDecoupee,
  type Morceau,
} from "@/features/cahiers/constants";
import { type EspeceLegende, legendeEspeces } from "./especes";

/** Code du gigot attribué d'office au tireur. */
const GIGOT = GIGOT_TIREUR_CODE;

/**
 * Part distribuée : code du morceau (null = animal entier) + espèce (null pour
 * une distribution antérieure à la précision de l'espèce).
 */
export type Part = { morceau: string | null; espece: string | null };

function part(morceau: string, espece: string | null): Part {
  return {
    morceau: morceau === ANIMAL_ENTIER_CODE ? null : morceau,
    espece,
  };
}

export type DistributionMatrix = {
  saison: string;
  morceaux: Morceau[];
  battues: { id: string; numero: number; date: string }[];
  lignes: {
    key: string;
    type: "PARTICIPANT" | "PROPRIETAIRE" | "INVITE";
    nom: string;
    prenom: string;
    /** Parts reçues par battue (gigot d'office + attributions manuelles). */
    cells: Record<string, Part[]>;
    total: number;
  }[];
  totalParBattue: Record<string, number>;
  totalGeneral: number;
  /** Espèces présentes dans le récap (abréviation + couleur). */
  especes: EspeceLegende[];
};

/**
 * Matrice de distribution : bénéficiaires (lignes) × battues (colonnes),
 * chaque case = codes des morceaux reçus. Le gigot d'office est dérivé des
 * prélèvements (1 par animal tiré) ; le reste vient des distributions.
 */
export async function saisonDistributionMatrix(
  cahierId: string,
): Promise<DistributionMatrix> {
  const [[cahierRow], battueRows, participantRows, proprietaireRows] =
    await Promise.all([
      db
        .select({
          saison: cahiers.saison,
          morceaux: cahiers.morceaux,
          especesDecoupees: cahiers.especesDecoupees,
        })
        .from(cahiers)
        .where(eq(cahiers.id, cahierId)),
      db
        .select({ id: battues.id, numero: battues.numero, date: battues.date })
        .from(battues)
        .where(and(eq(battues.cahierId, cahierId), isNull(battues.deletedAt)))
        .orderBy(asc(battues.date)),
      db
        .select({
          id: participants.id,
          nom: participants.nom,
          prenom: participants.prenom,
        })
        .from(participants)
        .where(
          and(
            eq(participants.cahierId, cahierId),
            isNull(participants.deletedAt),
          ),
        ),
      db
        .select({
          id: proprietaires.id,
          nom: proprietaires.nom,
          prenom: proprietaires.prenom,
          participantId: proprietaires.participantId,
        })
        .from(proprietaires)
        .where(
          and(
            eq(proprietaires.cahierId, cahierId),
            isNull(proprietaires.deletedAt),
          ),
        ),
    ]);

  const battueIds = battueRows.map((b) => b.id);
  const [prelevementRows, distributionRows, inviteRows] =
    battueIds.length === 0
      ? [[], [], []]
      : await Promise.all([
          db
            .select({
              battueId: prelevements.battueId,
              espece: prelevements.espece,
              tireurParticipantId: prelevements.tireurParticipantId,
              tireurInviteId: prelevements.tireurInviteId,
            })
            .from(prelevements)
            .innerJoin(battues, eq(battues.id, prelevements.battueId))
            .where(
              and(
                eq(battues.cahierId, cahierId),
                isNull(battues.deletedAt),
                isNull(prelevements.deletedAt),
              ),
            ),
          db
            .select({
              battueId: distributions.battueId,
              recipientType: distributions.recipientType,
              recipientId: distributions.recipientId,
              morceau: distributions.morceau,
              espece: distributions.espece,
            })
            .from(distributions)
            .innerJoin(battues, eq(battues.id, distributions.battueId))
            .where(
              and(
                eq(battues.cahierId, cahierId),
                isNull(battues.deletedAt),
                isNull(distributions.deletedAt),
              ),
            ),
          db
            .select({
              id: invites.id,
              nom: invites.nom,
              prenom: invites.prenom,
            })
            .from(invites)
            .where(
              and(eq(invites.cahierId, cahierId), isNull(invites.deletedAt)),
            ),
        ]);

  const partById = new Map(participantRows.map((p) => [p.id, p]));
  const propById = new Map(proprietaireRows.map((p) => [p.id, p]));
  const invById = new Map(inviteRows.map((i) => [i.id, i]));
  // Propriétaire lié à un chasseur → id du participant (pour fusionner les lignes).
  const propToParticipant = new Map(
    proprietaireRows
      .filter((p) => p.participantId)
      .map((p) => [p.id, p.participantId!] as const),
  );

  type Ligne = DistributionMatrix["lignes"][number];
  const lignes = new Map<string, Ligne>();
  const ensure = (
    type: Ligne["type"],
    id: string,
    nom: string,
    prenom: string,
  ): Ligne => {
    const key = `${type}:${id}`;
    let l = lignes.get(key);
    if (!l) {
      l = { key, type, nom, prenom, cells: {}, total: 0 };
      lignes.set(key, l);
    }
    return l;
  };
  const especesVues = new Set<string>();
  const push = (l: Ligne, battueId: string, p: Part) => {
    (l.cells[battueId] ??= []).push(p);
    if (p.espece) especesVues.add(p.espece);
    l.total += 1;
  };

  const especesDecoupees = cahierRow?.especesDecoupees ?? [];
  // Gigots d'office dérivés des prélèvements (espèces découpées uniquement).
  for (const p of prelevementRows) {
    if (!estEspeceDecoupee(p.espece, especesDecoupees)) continue;
    const gigot = part(GIGOT, p.espece);
    if (p.tireurParticipantId) {
      const part = partById.get(p.tireurParticipantId);
      if (part)
        push(
          ensure("PARTICIPANT", part.id, part.nom, part.prenom),
          p.battueId,
          gigot,
        );
    } else if (p.tireurInviteId) {
      const inv = invById.get(p.tireurInviteId);
      if (inv)
        push(ensure("INVITE", inv.id, inv.nom, inv.prenom), p.battueId, gigot);
    }
  }

  // Attributions manuelles. Un propriétaire lié à un chasseur est fusionné sur
  // la ligne du participant pour ne pas apparaître deux fois.
  for (const d of distributionRows) {
    let type = d.recipientType;
    let id = d.recipientId;
    if (type === "PROPRIETAIRE") {
      const linkedPid = propToParticipant.get(d.recipientId);
      if (linkedPid && partById.has(linkedPid)) {
        type = "PARTICIPANT";
        id = linkedPid;
      }
    }
    const info =
      type === "PARTICIPANT"
        ? partById.get(id)
        : type === "PROPRIETAIRE"
          ? propById.get(id)
          : invById.get(id);
    if (!info) continue;
    push(
      ensure(type, id, info.nom, info.prenom),
      d.battueId,
      part(d.morceau, d.espece),
    );
  }

  const totalParBattue: Record<string, number> = {};
  for (const b of battueRows) totalParBattue[b.id] = 0;
  for (const l of lignes.values()) {
    for (const [bid, codes] of Object.entries(l.cells)) {
      totalParBattue[bid] = (totalParBattue[bid] ?? 0) + codes.length;
    }
  }

  const sorted = [...lignes.values()].sort((a, b) =>
    `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr", {
      sensitivity: "base",
    }),
  );
  const totalGeneral = sorted.reduce((s, l) => s + l.total, 0);

  return {
    saison: cahierRow?.saison ?? "",
    morceaux: cahierRow?.morceaux ?? [],
    battues: battueRows,
    lignes: sorted,
    totalParBattue,
    totalGeneral,
    especes: legendeEspeces(especesVues),
  };
}
