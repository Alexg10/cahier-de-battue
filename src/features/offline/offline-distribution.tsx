"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ANIMAL_ENTIER_CODE,
  GIGOT_TIREUR_CODE,
  estEspeceDecoupee,
  libellePart,
  type Morceau,
} from "@/features/cahiers/constants";
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
  especesDecoupees,
}: {
  battueId: string;
  participants: SyncParticipant[];
  proprietaires: SyncProprietaire[];
  invitePersons: SyncInvitePerson[];
  morceaux: Morceau[];
  especesDecoupees: string[];
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

  // Prélèvements d'un tireur (participant ou invité).
  const tirsDe = (type: RecipientType, id: string) =>
    type === "PARTICIPANT"
      ? prelevements.filter((p) => p.tireurParticipantId === id)
      : type === "INVITE"
        ? prelevements.filter((p) => p.tireurInviteId === id)
        : [];

  // Gigots d'office : 1 par animal tiré d'une espèce découpée, par espèce.
  const autoGigots = (type: RecipientType, id: string) => {
    const parEspece = new Map<string, number>();
    for (const p of tirsDe(type, id)) {
      if (!estEspeceDecoupee(p.espece, especesDecoupees)) continue;
      parEspece.set(p.espece, (parEspece.get(p.espece) ?? 0) + 1);
    }
    return [...parEspece.entries()];
  };

  // Choix du select : espèces tirées ce jour. Espèce découpée → ses morceaux
  // (« Gigot Sanglier »…) ; autre espèce → l'animal entier (« Pigeon »).
  const especesDuJour = [...new Set(prelevements.map((p) => p.espece))].sort(
    (a, b) =>
      Number(estEspeceDecoupee(b, especesDecoupees)) -
        Number(estEspeceDecoupee(a, especesDecoupees)) ||
      a.localeCompare(b, "fr"),
  );
  const choixParts: PartGroup[] = especesDuJour.map((espece) =>
    estEspeceDecoupee(espece, especesDecoupees)
      ? {
          groupe: espece,
          options: morceaux.map((m) => ({
            morceau: m.code,
            espece,
            label: `${m.label} ${espece}`,
          })),
        }
      : {
          groupe: null,
          options: [{ morceau: ANIMAL_ENTIER_CODE, espece, label: espece }],
        },
  );

  type Recipient = (typeof recipients)[number];

  const renderRecipient = (r: Recipient) => {
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
          {gigots.map(([espece, n]) => (
            <span
              key={espece}
              className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary"
              title="Gigot attribué d'office au tireur"
            >
              {libellePart(GIGOT, espece, codeLabel)}
              {n > 1 ? ` ×${n}` : ""}
              <span className="text-[10px] font-normal">auto</span>
            </span>
          ))}

          {manual.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pl-2.5 pr-1 text-xs font-medium text-accent-foreground"
            >
              {libellePart(d.morceau, d.espece ?? null, codeLabel)}
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

          <AddPart
            groupes={choixParts}
            onAdd={(morceau, espece) =>
              addDistribution(battueId, r.type, r.id, morceau, espece)
            }
          />
        </div>
      </li>
    );
  };

  // Sous-sections : tireurs (au moins un animal tiré), puis propriétaires
  // (dont les chasseurs propriétaires non tireurs), puis le reste.
  const estTireur = (r: Recipient) => tirsDe(r.type, r.id).length > 0;
  const estProprietaire = (r: Recipient) =>
    r.type === "PROPRIETAIRE" ||
    (r.type === "PARTICIPANT" && landownerIds.has(r.id));
  const sections = [
    { titre: "Tireurs", rows: recipients.filter(estTireur) },
    {
      titre: "Propriétaires",
      rows: recipients.filter((r) => !estTireur(r) && estProprietaire(r)),
    },
    {
      titre: "Autres participants",
      rows: recipients.filter((r) => !estTireur(r) && !estProprietaire(r)),
    },
  ].filter((sec) => sec.rows.length > 0);

  return (
    <div className="flex flex-col gap-5">
      {morceaux.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ajoutez des morceaux dans les Réglages du cahier pour distribuer les
          espèces découpées.
        </p>
      ) : null}
      {recipients.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun bénéficiaire (personne n&apos;a signé le pointage).
        </p>
      ) : (
        sections.map((sec) => (
          <section key={sec.titre} className="flex flex-col gap-2">
            <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {sec.titre} ({sec.rows.length})
            </h4>
            <ul className="flex flex-col gap-2">
              {sec.rows.map(renderRecipient)}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

/** Parts proposées pour une espèce (groupe nommé si découpée en morceaux). */
type PartGroup = {
  groupe: string | null;
  options: { morceau: string; espece: string; label: string }[];
};

function AddPart({
  groupes,
  onAdd,
  className,
}: {
  groupes: PartGroup[];
  onAdd: (morceau: string, espece: string) => void;
  className?: string;
}) {
  const options = (g: PartGroup) =>
    g.options.map((o) => (
      <option
        key={`${o.morceau}|${o.espece}`}
        value={`${o.morceau}|${o.espece}`}
      >
        {o.label}
      </option>
    ));
  return (
    <Select
      aria-label="Ajouter un morceau"
      value=""
      disabled={groupes.length === 0}
      onChange={(e) => {
        const v = e.target.value;
        if (v) {
          const sep = v.indexOf("|");
          onAdd(v.slice(0, sep), v.slice(sep + 1));
        }
        e.target.value = "";
      }}
      className={cn("h-8 w-auto min-w-[8rem] py-0 pr-8 text-xs", className)}
    >
      <option value="">
        {groupes.length === 0 ? "Aucun animal tiré" : "+ morceau"}
      </option>
      {groupes.map((g) =>
        g.groupe ? (
          <optgroup key={g.groupe} label={g.groupe}>
            {options(g)}
          </optgroup>
        ) : (
          options(g)
        ),
      )}
    </Select>
  );
}
