"use client";

import { Pencil, UserPlus } from "lucide-react";
import { useState } from "react";
import { SignaturePad } from "@/components/signature-pad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LocalInvite } from "./db";
import { SECURITY_NOTICE } from "./constants";
import { useInvites } from "./hooks";
import { removeInvite, upsertInvite } from "./sync";
import type { SyncParticipant } from "./types";

export function OfflineInvites({
  battueId,
  participants,
}: {
  battueId: string;
  participants: SyncParticipant[];
}) {
  const invites = useInvites(battueId) ?? [];
  const [editing, setEditing] = useState<null | "new" | LocalInvite>(null);

  return (
    <div className="flex flex-col gap-3">
      {editing ? (
        <InviteEditor
          battueId={battueId}
          participants={participants}
          invite={editing === "new" ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <>
          <Button block variant="secondary" onClick={() => setEditing("new")}>
            <UserPlus />
            Ajouter un invité
          </Button>
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun invité pour cette battue.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {invites.map((i) => {
                const parrain = participants.find(
                  (p) => p.id === i.participantId,
                );
                return (
                  <li
                    key={i.id}
                    className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {i.prenom} {i.nom}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="muted">
                          {i.role === "POSTE" ? "Posté" : "Traqueur"}
                        </Badge>
                        {parrain ? (
                          <span>
                            Invité par {parrain.prenom} {parrain.nom}
                          </span>
                        ) : null}
                        {i.signature ? (
                          <Badge variant="success">Signé</Badge>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Modifier"
                      onClick={() => setEditing(i)}
                      className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                    >
                      <Pencil className="size-5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function InviteEditor({
  battueId,
  participants,
  invite,
  onDone,
}: {
  battueId: string;
  participants: SyncParticipant[];
  invite?: LocalInvite;
  onDone: () => void;
}) {
  const [nom, setNom] = useState(invite?.nom ?? "");
  const [prenom, setPrenom] = useState(invite?.prenom ?? "");
  const [participantId, setParticipantId] = useState(
    invite?.participantId ?? "",
  );
  const [numPermis, setNumPermis] = useState(invite?.numPermis ?? "");
  const [numValidation, setNumValidation] = useState(
    invite?.numValidation ?? "",
  );
  const [numAssurance, setNumAssurance] = useState(invite?.numAssurance ?? "");
  const [role, setRole] = useState<"POSTE" | "TRAQUEUR">(invite?.role ?? "POSTE");
  const [signature, setSignature] = useState<string | null>(
    invite?.signature ?? null,
  );
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (!prenom.trim() || !nom.trim()) {
      setError("Nom et prénom obligatoires.");
      return;
    }
    if (!participantId) {
      setError("Rattachez l'invité à un membre.");
      return;
    }
    upsertInvite(battueId, {
      id: invite?.id,
      participantId,
      nom: nom.trim(),
      prenom: prenom.trim(),
      numPermis: numPermis.trim() || null,
      numValidation: numValidation.trim() || null,
      numAssurance: numAssurance.trim() || null,
      role,
      signature,
    });
    onDone();
  }

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" required>
          <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
        </Field>
        <Field label="Nom" required>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} />
        </Field>
      </div>
      <Field label="Invité par (membre)" required>
        <Select
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
        >
          <option value="" disabled>
            — Choisir un membre —
          </option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.prenom} {p.nom}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="N° de permis">
        <Input value={numPermis} onChange={(e) => setNumPermis(e.target.value)} />
      </Field>
      <Field label="N° de validation annuelle">
        <Input
          value={numValidation}
          onChange={(e) => setNumValidation(e.target.value)}
        />
      </Field>
      <Field label="N° de contrat d'assurance">
        <Input
          value={numAssurance}
          onChange={(e) => setNumAssurance(e.target.value)}
        />
      </Field>
      <Field label="Poste">
        <div className="inline-flex overflow-hidden rounded-full border border-border">
          {(["POSTE", "TRAQUEUR"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-colors",
                role === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground",
              )}
            >
              {r === "POSTE" ? "Posté" : "Traqueur"}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Signature de l'invité">
        {signing ? (
          <SignaturePad
            onSave={(url) => {
              setSignature(url);
              setSigning(false);
            }}
            onCancel={() => setSigning(false)}
            notice={SECURITY_NOTICE}
          />
        ) : signature ? (
          <div className="flex items-center gap-3">
            <div className="flex h-20 flex-1 items-center justify-center rounded-[var(--radius)] border border-border bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signature}
                alt="Signature invité"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <Button type="button" variant="secondary" onClick={() => setSigning(true)}>
              Modifier
            </Button>
          </div>
        ) : (
          <Button type="button" variant="secondary" onClick={() => setSigning(true)}>
            Faire signer
          </Button>
        )}
      </Field>

      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Button onClick={save} block>
          {invite ? "Enregistrer" : "Ajouter l'invité"}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" block onClick={onDone}>
            Annuler
          </Button>
          {invite ? (
            <ConfirmDelete
              action={() => {
                removeInvite(battueId, invite.id);
                onDone();
              }}
              label="Supprimer"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
