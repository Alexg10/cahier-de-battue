"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { GIGOT_TIREUR_CODE, type Morceau } from "@/features/cahiers/constants";
import {
  useDistributions,
  useInviteParticipations,
  usePointages,
  usePrelevements,
} from "./hooks";
import { addDistribution, removeDistribution } from "./sync";
import type {
  SyncInvitePerson,
  SyncParticipant,
  SyncProprietaire,
} from "./types";

type RecipientType = "PARTICIPANT" | "PROPRIETAIRE" | "INVITE";

/** Libellé du type d'un participant bénéficiaire. */
const PARTICIPANT_TYPE_BADGE: Record<string, string> = {
  CHASSEUR: "Chasseur",
  TRAQUEUR: "Traqueur",
  ACCOMPAGNANT: "Accompagnant",
};

/** Code du gigot attribué d'office (référence la liste des morceaux). */
const GIGOT = GIGOT_TIREUR_CODE;

export function OfflineDistribution({
  battueId,
  participants,
  proprietaires,
  invitePersons,
  morceaux,
}: {
  battueId: string;
  participants: SyncParticipant[];
  proprietaires: SyncProprietaire[];
  invitePersons: SyncInvitePerson[];
  morceaux: Morceau[];
}) {
  const pointages = usePointages(battueId) ?? [];
  const participations = useInviteParticipations(battueId) ?? [];
  const prelevements = usePrelevements(battueId) ?? [];
  const distributions = useDistributions(battueId) ?? [];
  // Invités présents ce jour (participations → personnes) = bénéficiaires.
  const invitePersonById = new Map(invitePersons.map((p) => [p.id, p]));
  const invitesPresents = participations
    .map((part) => invitePersonById.get(part.inviteId))
    .filter((p): p is SyncInvitePerson => Boolean(p));

  const codeLabel = (code: string) =>
    morceaux.find((m) => m.code === code)?.label ?? code;

  // Bénéficiaires = chasseurs présents + propriétaires + invités du jour.
  const signedIds = new Set(pointages.map((p) => p.participantId));
  // Chasseurs qui sont aussi propriétaires fonciers : toujours bénéficiaires
  // (même absents), et représentés une seule fois par leur fiche participant.
  const landownerIds = new Set(
    proprietaires
      .map((p) => p.participantId)
      .filter((id): id is string => Boolean(id)),
  );
  // Propriétaires liés à un chasseur, indexés par participant (pour rattacher
  // d'éventuelles attributions héritées faites à la fiche propriétaire).
  const linkedPropIdsByParticipant = new Map<string, string[]>();
  for (const p of proprietaires) {
    if (p.participantId) {
      const arr = linkedPropIdsByParticipant.get(p.participantId) ?? [];
      arr.push(p.id);
      linkedPropIdsByParticipant.set(p.participantId, arr);
    }
  }
  const recipients: {
    type: RecipientType;
    id: string;
    nom: string;
    prenom: string;
    badge: string;
  }[] = [
    ...participants
      .filter((p) => signedIds.has(p.id) || landownerIds.has(p.id))
      .map((p) => ({
        type: "PARTICIPANT" as const,
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        badge: PARTICIPANT_TYPE_BADGE[p.type] ?? "Chasseur",
      })),
    // Seuls les propriétaires « seuls » (non liés à un chasseur) ont une ligne.
    ...proprietaires
      .filter((p) => !p.participantId)
      .map((p) => ({
        type: "PROPRIETAIRE" as const,
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        badge: "Propriétaire",
      })),
    ...invitesPresents.map((i) => ({
      type: "INVITE" as const,
      id: i.id,
      nom: i.nom,
      prenom: i.prenom,
      badge: "Invité",
    })),
  ].sort((a, b) =>
      `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr", {
        sensitivity: "base",
      }),
    );

  // Gigots d'office : 1 par animal tiré (dérivé des prélèvements).
  const autoGigots = (type: RecipientType, id: string) => {
    if (type === "PARTICIPANT")
      return prelevements.filter((p) => p.tireurParticipantId === id).length;
    if (type === "INVITE")
      return prelevements.filter((p) => p.tireurInviteId === id).length;
    return 0;
  };

  if (morceaux.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ajoutez des morceaux dans les Réglages du cahier pour distribuer le
        gibier.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {recipients.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun bénéficiaire (personne n&apos;a signé le pointage).
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {recipients.map((r) => {
            const key = `${r.type}:${r.id}`;
            const linkedPropIds =
              r.type === "PARTICIPANT"
                ? (linkedPropIdsByParticipant.get(r.id) ?? [])
                : [];
            const manual = distributions.filter(
              (d) =>
                (d.recipientType === r.type && d.recipientId === r.id) ||
                // Attributions héritées faites à la fiche propriétaire liée.
                (d.recipientType === "PROPRIETAIRE" &&
                  linkedPropIds.includes(d.recipientId)),
            );
            const gigots = autoGigots(r.type, r.id);
            return (
              <li
                key={key}
                className="rounded-[var(--radius)] border border-border bg-card p-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    {r.nom.toUpperCase()} {r.prenom}
                  </span>
                  <Badge variant="muted">{r.badge}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {gigots > 0 ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary"
                      title="Gigot attribué d'office au tireur"
                    >
                      {codeLabel(GIGOT)}
                      {gigots > 1 ? ` ×${gigots}` : ""}
                      <span className="text-[10px] font-normal">auto</span>
                    </span>
                  ) : null}

                  {manual.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pl-2.5 pr-1 text-xs font-medium text-accent-foreground"
                    >
                      {codeLabel(d.morceau)}
                      <button
                        type="button"
                        aria-label="Retirer"
                        onClick={() => removeDistribution(battueId, d.id)}
                        className="flex size-4 items-center justify-center rounded-full hover:bg-background/60"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}

                  <AddMorceau
                    morceaux={morceaux}
                    onAdd={(code) =>
                      addDistribution(battueId, r.type, r.id, code)
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AddMorceau({
  morceaux,
  onAdd,
  className,
}: {
  morceaux: Morceau[];
  onAdd: (code: string) => void;
  className?: string;
}) {
  return (
    <Select
      aria-label="Ajouter un morceau"
      value=""
      onChange={(e) => {
        if (e.target.value) onAdd(e.target.value);
        e.target.value = "";
      }}
      className={cn("h-8 w-auto min-w-[8rem] py-0 pr-8 text-xs", className)}
    >
      <option value="">+ morceau</option>
      {morceaux.map((m) => (
        <option key={m.code} value={m.code}>
          {m.label} ({m.code})
        </option>
      ))}
    </Select>
  );
}
