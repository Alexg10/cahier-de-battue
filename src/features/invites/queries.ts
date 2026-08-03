import "server-only";
import { alias } from "drizzle-orm/pg-core";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  inviteParticipations,
  invites,
  participants,
  proprietaires,
} from "@/db/schema";

export type Invite = typeof invites.$inferSelect;

export type CahierInvite = Invite & {
  parrainNom: string | null;
  parrainPrenom: string | null;
};

/**
 * Liste les invités d'un cahier (personnes), avec le nom du parrain, qu'il
 * soit chasseur (participant) ou propriétaire.
 */
export async function listCahierInvites(
  cahierId: string,
): Promise<CahierInvite[]> {
  const part = alias(participants, "parr_part");
  const prop = alias(proprietaires, "parr_prop");
  const rows = await db
    .select({
      invite: invites,
      partNom: part.nom,
      partPrenom: part.prenom,
      propNom: prop.nom,
      propPrenom: prop.prenom,
    })
    .from(invites)
    .leftJoin(
      part,
      and(eq(invites.parrainType, "PARTICIPANT"), eq(part.id, invites.parrainId)),
    )
    .leftJoin(
      prop,
      and(
        eq(invites.parrainType, "PROPRIETAIRE"),
        eq(prop.id, invites.parrainId),
      ),
    )
    .where(and(eq(invites.cahierId, cahierId), isNull(invites.deletedAt)))
    .orderBy(asc(invites.nom), asc(invites.prenom));
  return rows.map((r) => ({
    ...r.invite,
    parrainNom: r.partNom ?? r.propNom,
    parrainPrenom: r.partPrenom ?? r.propPrenom,
  }));
}

/** Parrains possibles d'un invité : chasseurs + propriétaires (pour le select). */
export async function listParrainOptions(
  cahierId: string,
): Promise<{ value: string; label: string }[]> {
  const [chasseurs, props] = await Promise.all([
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
          eq(participants.estChasseur, true),
        ),
      )
      .orderBy(asc(participants.nom), asc(participants.prenom)),
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
      )
      .orderBy(asc(proprietaires.nom), asc(proprietaires.prenom)),
  ]);
  return [
    ...chasseurs.map((p) => ({
      value: `PARTICIPANT:${p.id}`,
      label: `${p.nom.toUpperCase()} ${p.prenom}`,
    })),
    ...props.map((p) => ({
      value: `PROPRIETAIRE:${p.id}`,
      label: `${p.nom.toUpperCase()} ${p.prenom} (propriétaire)`,
    })),
  ];
}

/** Récupère un invité (personne) en s'assurant qu'il appartient au cahier. */
export async function getCahierInvite(cahierId: string, id: string) {
  const [row] = await db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.id, id),
        eq(invites.cahierId, cahierId),
        isNull(invites.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Vue d'un invité présent sur une battue (identité + rôle/signature du jour). */
export type BattueInvite = {
  invite: {
    id: string;
    nom: string;
    prenom: string;
    numPermis: string | null;
    numValidation: string | null;
    numAssurance: string | null;
    role: "POSTE" | "TRAQUEUR";
    signature: string | null;
  };
  parrainNom: string | null;
  parrainPrenom: string | null;
};

/** Liste les invités présents sur une battue (participations jointes aux personnes). */
export async function listInvites(battueId: string): Promise<BattueInvite[]> {
  const part = alias(participants, "parr_part");
  const prop = alias(proprietaires, "parr_prop");
  const rows = await db
    .select({
      participationId: inviteParticipations.id,
      role: inviteParticipations.role,
      signature: inviteParticipations.signature,
      nom: invites.nom,
      prenom: invites.prenom,
      numPermis: invites.numPermis,
      numValidation: invites.numValidation,
      numAssurance: invites.numAssurance,
      partNom: part.nom,
      partPrenom: part.prenom,
      propNom: prop.nom,
      propPrenom: prop.prenom,
    })
    .from(inviteParticipations)
    .innerJoin(invites, eq(invites.id, inviteParticipations.inviteId))
    .leftJoin(
      part,
      and(eq(invites.parrainType, "PARTICIPANT"), eq(part.id, invites.parrainId)),
    )
    .leftJoin(
      prop,
      and(
        eq(invites.parrainType, "PROPRIETAIRE"),
        eq(prop.id, invites.parrainId),
      ),
    )
    .where(
      and(
        eq(inviteParticipations.battueId, battueId),
        isNull(inviteParticipations.deletedAt),
        isNull(invites.deletedAt),
      ),
    )
    .orderBy(asc(invites.nom), asc(invites.prenom));
  return rows.map((r) => ({
    invite: {
      id: r.participationId,
      nom: r.nom,
      prenom: r.prenom,
      numPermis: r.numPermis,
      numValidation: r.numValidation,
      numAssurance: r.numAssurance,
      role: r.role,
      signature: r.signature,
    },
    parrainNom: r.partNom ?? r.propNom,
    parrainPrenom: r.partPrenom ?? r.propPrenom,
  }));
}
