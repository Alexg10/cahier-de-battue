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
import { GIGOT_TIREUR_CODE, type Morceau } from "@/features/cahiers/constants";

/** Code du gigot attribué d'office au tireur. */
const GIGOT = GIGOT_TIREUR_CODE;

export type DistributionMatrix = {
  saison: string;
  morceaux: Morceau[];
  battues: { id: string; numero: number; date: string }[];
  lignes: {
    key: string;
    type: "PARTICIPANT" | "PROPRIETAIRE" | "INVITE";
    nom: string;
    prenom: string;
    /** Codes reçus par battue (gigot d'office + attributions manuelles). */
    cells: Record<string, string[]>;
    total: number;
  }[];
  totalParBattue: Record<string, number>;
  totalGeneral: number;
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
        .select({ saison: cahiers.saison, morceaux: cahiers.morceaux })
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
            .innerJoin(battues, eq(battues.id, invites.battueId))
            .where(
              and(
                eq(battues.cahierId, cahierId),
                isNull(battues.deletedAt),
                isNull(invites.deletedAt),
              ),
            ),
        ]);

  const partById = new Map(participantRows.map((p) => [p.id, p]));
  const propById = new Map(proprietaireRows.map((p) => [p.id, p]));
  const invById = new Map(inviteRows.map((i) => [i.id, i]));

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
  const push = (l: Ligne, battueId: string, code: string) => {
    (l.cells[battueId] ??= []).push(code);
    l.total += 1;
  };

  // Gigots d'office dérivés des prélèvements.
  for (const p of prelevementRows) {
    if (p.tireurParticipantId) {
      const part = partById.get(p.tireurParticipantId);
      if (part)
        push(
          ensure("PARTICIPANT", part.id, part.nom, part.prenom),
          p.battueId,
          GIGOT,
        );
    } else if (p.tireurInviteId) {
      const inv = invById.get(p.tireurInviteId);
      if (inv)
        push(ensure("INVITE", inv.id, inv.nom, inv.prenom), p.battueId, GIGOT);
    }
  }

  // Attributions manuelles.
  for (const d of distributionRows) {
    const info =
      d.recipientType === "PARTICIPANT"
        ? partById.get(d.recipientId)
        : d.recipientType === "PROPRIETAIRE"
          ? propById.get(d.recipientId)
          : invById.get(d.recipientId);
    if (!info) continue;
    push(
      ensure(d.recipientType, d.recipientId, info.nom, info.prenom),
      d.battueId,
      d.morceau,
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
  };
}
