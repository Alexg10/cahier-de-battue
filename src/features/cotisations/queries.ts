import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { battues, cahiers, participants, pointages } from "@/db/schema";

export type CotisationCell = { participe: boolean; montant: number };

export type CotisationsMatrix = {
  saison: string;
  montantChasse: number;
  montantChiens: number;
  battues: { id: string; numero: number; date: string }[];
  lignes: {
    id: string;
    nom: string;
    prenom: string;
    cells: Record<string, CotisationCell>;
    total: number;
  }[];
  totalParBattue: Record<string, number>;
  totalGeneral: number;
};

/**
 * Matrice des cotisations de la saison : participants (lignes) × battues
 * (colonnes), avec participation + montant par case, et totaux.
 */
export async function saisonCotisationsMatrix(
  cahierId: string,
): Promise<CotisationsMatrix> {
  const [[cahierRow], battueRows, participantRows, pointageRows] =
    await Promise.all([
      db
        .select({
          saison: cahiers.saison,
          chasse: cahiers.cotisationChasse,
          chiens: cahiers.cotisationChiens,
        })
        .from(cahiers)
        .where(eq(cahiers.id, cahierId)),
      db
        .select({
          id: battues.id,
          numero: battues.numero,
          date: battues.date,
        })
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
            eq(participants.estChasseur, true),
            isNull(participants.deletedAt),
          ),
        )
        .orderBy(asc(participants.nom), asc(participants.prenom)),
      db
        .select({
          battueId: pointages.battueId,
          participantId: pointages.participantId,
          cotisationChasse: pointages.cotisationChasse,
          cotisationChiens: pointages.cotisationChiens,
        })
        .from(pointages)
        .innerJoin(battues, eq(battues.id, pointages.battueId))
        .where(
          and(
            eq(battues.cahierId, cahierId),
            isNull(battues.deletedAt),
            isNull(pointages.deletedAt),
          ),
        ),
    ]);

  const montantChasse = Number(cahierRow?.chasse ?? 0);
  const montantChiens = Number(cahierRow?.chiens ?? 0);

  // Index des pointages par participant puis battue.
  const parPart = new Map<string, Map<string, CotisationCell>>();
  for (const pt of pointageRows) {
    const montant =
      (pt.cotisationChasse ? montantChasse : 0) +
      (pt.cotisationChiens ? montantChiens : 0);
    const participe = pt.cotisationChasse || pt.cotisationChiens;
    if (!parPart.has(pt.participantId)) parPart.set(pt.participantId, new Map());
    parPart.get(pt.participantId)!.set(pt.battueId, { participe, montant });
  }

  const totalParBattue: Record<string, number> = {};
  for (const b of battueRows) totalParBattue[b.id] = 0;

  const lignes = participantRows.map((p) => {
    const src = parPart.get(p.id);
    const cells: Record<string, CotisationCell> = {};
    let total = 0;
    for (const b of battueRows) {
      const cell = src?.get(b.id) ?? { participe: false, montant: 0 };
      cells[b.id] = cell;
      total += cell.montant;
      totalParBattue[b.id] += cell.montant;
    }
    return { id: p.id, nom: p.nom, prenom: p.prenom, cells, total };
  });

  const totalGeneral = lignes.reduce((s, l) => s + l.total, 0);

  return {
    saison: cahierRow?.saison ?? "",
    montantChasse,
    montantChiens,
    battues: battueRows,
    lignes,
    totalParBattue,
    totalGeneral,
  };
}
