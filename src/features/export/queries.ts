import "server-only";
import { alias } from "drizzle-orm/pg-core";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  battues,
  invites,
  participants,
  pointages,
  prelevements,
} from "@/db/schema";

/** Toutes les battues d'un cahier avec le nom du responsable (pour export). */
export async function saisonBattues(cahierId: string) {
  return db
    .select({
      id: battues.id,
      numero: battues.numero,
      date: battues.date,
      lieu: battues.lieu,
      heureDebut: battues.heureDebut,
      heureFin: battues.heureFin,
      especesJour: battues.especesJour,
      responsableNom: participants.nom,
      responsablePrenom: participants.prenom,
    })
    .from(battues)
    .leftJoin(participants, eq(participants.id, battues.responsableId))
    .where(and(eq(battues.cahierId, cahierId), isNull(battues.deletedAt)))
    .orderBy(asc(battues.date));
}

/** Drapeaux de cotisation de tous les pointages d'un cahier (par battue). */
export async function saisonPointageCotisations(cahierId: string) {
  return db
    .select({
      battueId: pointages.battueId,
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
    );
}

/** Tous les prélèvements d'un cahier, avec date de battue et tireur. */
export async function saisonPrelevements(cahierId: string) {
  const tireurP = alias(participants, "tireur_p");
  const rows = await db
    .select({
      date: battues.date,
      espece: prelevements.espece,
      numBracelet: prelevements.numBracelet,
      age: prelevements.age,
      sexe: prelevements.sexe,
      poids: prelevements.poids,
      pNom: tireurP.nom,
      pPrenom: tireurP.prenom,
      iNom: invites.nom,
      iPrenom: invites.prenom,
    })
    .from(prelevements)
    .innerJoin(battues, eq(battues.id, prelevements.battueId))
    .leftJoin(tireurP, eq(tireurP.id, prelevements.tireurParticipantId))
    .leftJoin(invites, eq(invites.id, prelevements.tireurInviteId))
    .where(
      and(
        eq(battues.cahierId, cahierId),
        isNull(battues.deletedAt),
        isNull(prelevements.deletedAt),
      ),
    )
    .orderBy(asc(battues.date));

  return rows.map((r) => ({
    date: r.date,
    espece: r.espece,
    numBracelet: r.numBracelet,
    age: r.age,
    sexe: r.sexe,
    poids: r.poids,
    tireur: r.pPrenom
      ? `${r.pPrenom} ${r.pNom}`
      : r.iPrenom
        ? `${r.iPrenom} ${r.iNom} (invité)`
        : "",
  }));
}
