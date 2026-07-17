"use client";

import { AlertTriangle, Check, Coins, Pencil, PenLine, X } from "lucide-react";
import { useState } from "react";
import { SignaturePad } from "@/components/signature-pad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SyncParticipant } from "./types";
import { SECURITY_NOTICE } from "./constants";
import { useParticipants, usePointages } from "./hooks";
import { ParticipantInfoDialog } from "./participant-info-dialog";
import {
  removePointage,
  setPointageCotisations,
  setPointageRole,
  signPointage,
} from "./sync";

const ROLE_LABEL = { POSTE: "Posté", TRAQUEUR: "Traqueur" } as const;

/** Affichage officiel : NOM (majuscules) puis prénom. */
const fullName = (p: { nom: string; prenom: string }) =>
  `${p.nom.toUpperCase()} ${p.prenom}`;

/** Vrai si au moins une info à vérifier manque (permis, assurance, tél…). */
const infosManquantes = (p: SyncParticipant) =>
  !p.telephone ||
  !p.numPermis ||
  !p.numValidation ||
  !(p.nomAssurance || p.numAssurance);

export function OfflinePointage({
  battueId,
  chasseurs,
  cotisationChasse,
  cotisationChiens,
}: {
  battueId: string;
  chasseurs: SyncParticipant[];
  cotisationChasse: number;
  cotisationChiens: number;
}) {
  const pointages = usePointages(battueId) ?? [];
  // Données locales réactives (reflètent les corrections) ; repli sur le prop
  // au premier rendu avant l'hydratation IndexedDB.
  const live = useParticipants(battueId);
  const chasseursTries = (live && live.length ? live : chasseurs)
    .filter((p) => p.estChasseur)
    .sort((a, b) =>
      `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr", {
        sensitivity: "base",
      }),
    );

  const [openId, setOpenId] = useState<string | null>(null);
  const [role, setRole] = useState<"POSTE" | "TRAQUEUR">("POSTE");
  const [cotChasse, setCotChasse] = useState(false);
  const [cotChiens, setCotChiens] = useState(false);
  const [editing, setEditing] = useState<SyncParticipant | null>(null);

  const byId = new Map(pointages.map((p) => [p.participantId, p]));
  const signedCount = pointages.length;

  const hasCotisations = cotisationChasse > 0 || cotisationChiens > 0;
  const totalRecolte = pointages.reduce(
    (sum, p) =>
      sum +
      (p.cotisationChasse ? cotisationChasse : 0) +
      (p.cotisationChiens ? cotisationChiens : 0),
    0,
  );
  // Nombre de personnes ayant versé au moins une cotisation.
  const nbDonneurs = pointages.filter(
    (p) => p.cotisationChasse || p.cotisationChiens,
  ).length;

  // Ouvre le panneau de signature en pré-remplissant depuis un pointage existant.
  function openPanel(participantId: string, existing?: (typeof pointages)[number]) {
    setRole(existing?.role ?? "POSTE");
    setCotChasse(existing?.cotisationChasse ?? false);
    setCotChiens(existing?.cotisationChiens ?? false);
    setOpenId(participantId);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {signedCount} / {chasseursTries.length} chasseur
          {chasseursTries.length > 1 ? "s" : ""} ont signé.
        </p>
        {hasCotisations ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
            <Coins className="size-4" />
            {formatEuro(totalRecolte)} récoltés · {nbDonneurs} donneur
            {nbDonneurs > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>
      <ul className="flex flex-col gap-2">
        {chasseursTries.map((p) => {
          const pt = byId.get(p.id);
          const isOpen = openId === p.id;
          return (
            <li
              key={p.id}
              className="rounded-[var(--radius)] border border-border bg-card"
            >
              <div className="flex items-center gap-3 p-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    pt
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {pt ? (
                    <Check className="size-5" />
                  ) : (
                    <PenLine className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <span className="truncate">{fullName(p)}</span>
                    {infosManquantes(p) ? (
                      <AlertTriangle
                        className="size-4 shrink-0 text-destructive"
                        aria-label="Informations manquantes"
                      />
                    ) : null}
                  </p>
                  {pt ? (
                    <Badge variant="default">{ROLE_LABEL[pt.role]}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      À faire signer
                    </span>
                  )}
                </div>
                {pt ? (
                  <button
                    type="button"
                    aria-label="Annuler le pointage"
                    onClick={() => removePointage(battueId, p.id)}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-5" />
                  </button>
                ) : (
                  <Button size="sm" onClick={() => openPanel(p.id)}>
                    Signer
                  </Button>
                )}
              </div>

              {pt && !isOpen ? (
                <div className="flex flex-col gap-2 border-t border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Rôle :
                    </span>
                    <RoleToggle
                      value={pt.role}
                      onChange={(r) => setPointageRole(battueId, p.id, r)}
                    />
                    <button
                      type="button"
                      onClick={() => openPanel(p.id, pt)}
                      className="ml-auto text-xs font-semibold text-primary hover:underline"
                    >
                      Re-signer
                    </button>
                  </div>
                  {hasCotisations ? (
                    <div className="flex flex-wrap gap-3">
                      {cotisationChasse > 0 ? (
                        <CotisationCheck
                          label={`Chasse (${formatEuro(cotisationChasse)})`}
                          checked={pt.cotisationChasse}
                          onChange={(v) =>
                            setPointageCotisations(battueId, p.id, {
                              chasse: v,
                              chiens: pt.cotisationChiens,
                            })
                          }
                        />
                      ) : null}
                      {cotisationChiens > 0 ? (
                        <CotisationCheck
                          label={`Chiens (${formatEuro(cotisationChiens)})`}
                          checked={pt.cotisationChiens}
                          onChange={(v) =>
                            setPointageCotisations(battueId, p.id, {
                              chasse: pt.cotisationChasse,
                              chiens: v,
                            })
                          }
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isOpen ? (
                <div className="border-t border-border p-3">
                  <p className="mb-2 text-sm font-bold">
                    Signature de {fullName(p)}
                  </p>
                  <InfoBlock
                    participant={p}
                    onEdit={() => setEditing(p)}
                  />
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm font-semibold">Rôle :</span>
                    <RoleToggle value={role} onChange={setRole} />
                  </div>
                  {hasCotisations ? (
                    <div className="mb-3 flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-muted/40 p-3">
                      <span className="text-sm font-semibold">Cotisations</span>
                      {cotisationChasse > 0 ? (
                        <CotisationCheck
                          label={`Cotisation chasse (${formatEuro(cotisationChasse)})`}
                          checked={cotChasse}
                          onChange={setCotChasse}
                        />
                      ) : null}
                      {cotisationChiens > 0 ? (
                        <CotisationCheck
                          label={`Cotisation chiens (${formatEuro(cotisationChiens)})`}
                          checked={cotChiens}
                          onChange={setCotChiens}
                        />
                      ) : null}
                    </div>
                  ) : null}
                  <SignaturePad
                    onSave={(url) => {
                      signPointage(battueId, p.id, url, role, {
                        chasse: cotChasse,
                        chiens: cotChiens,
                      });
                      setOpenId(null);
                    }}
                    onCancel={() => setOpenId(null)}
                    saveLabel="Valider la signature"
                    notice={SECURITY_NOTICE}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <ParticipantInfoDialog
        battueId={battueId}
        participant={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

/** Récapitulatif des infos à vérifier avant signature, avec accès à la correction. */
function InfoBlock({
  participant,
  onEdit,
}: {
  participant: SyncParticipant;
  onEdit: () => void;
}) {
  const assurance = [participant.nomAssurance, participant.numAssurance]
    .filter(Boolean)
    .join(" · ");
  const rows: [string, string | null][] = [
    ["Téléphone", participant.telephone],
    ["N° permis", participant.numPermis],
    ["Validation", participant.numValidation],
    ["Assurance", assurance || null],
  ];
  return (
    <div className="mb-3 rounded-[var(--radius)] border border-border bg-muted/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Infos à vérifier
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Pencil className="size-3.5" />
          Modifier
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt
              className={
                value
                  ? "font-semibold text-muted-foreground"
                  : "font-semibold text-destructive"
              }
            >
              {label}
            </dt>
            <dd>
              {value ? (
                value
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-destructive">
                  <AlertTriangle className="size-3.5" />
                  Manquant
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CotisationCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-6 accent-primary"
      />
      {label}
    </label>
  );
}

function RoleToggle({
  value,
  onChange,
}: {
  value: "POSTE" | "TRAQUEUR";
  onChange: (r: "POSTE" | "TRAQUEUR") => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-border">
      {(["POSTE", "TRAQUEUR"] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "px-3 py-1 text-xs font-semibold transition-colors",
            value === r
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground",
          )}
        >
          {ROLE_LABEL[r]}
        </button>
      ))}
    </div>
  );
}
