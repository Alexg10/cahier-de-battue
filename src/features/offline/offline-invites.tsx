"use client";

import { Pencil, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SignaturePad } from "@/components/signature-pad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createInviteQuick } from "@/features/invites/actions";
import type { LocalInviteParticipation } from "./db";
import { SECURITY_NOTICE } from "./constants";
import { useInviteParticipations, useOnline } from "./hooks";
import {
  removeInviteParticipation,
  upsertInviteParticipation,
} from "./sync";
import type { SyncInvitePerson } from "./types";

/** Option de parrain : un chasseur ou un propriétaire. */
export type ParrainOption = { value: string; label: string };

const fullName = (p: { nom: string; prenom: string }) =>
  `${p.nom.toUpperCase()} ${p.prenom}`;

export function OfflineInvites({
  battueId,
  cahierId,
  invitePersons,
  parrains,
}: {
  battueId: string;
  cahierId: string;
  invitePersons: SyncInvitePerson[];
  parrains: ParrainOption[];
}) {
  const participations = useInviteParticipations(battueId) ?? [];
  const [editing, setEditing] = useState<
    null | "new" | LocalInviteParticipation
  >(null);
  const [creating, setCreating] = useState(false);

  const personById = new Map(invitePersons.map((p) => [p.id, p]));
  const usedIds = new Set(participations.map((p) => p.inviteId));

  const sorted = [...participations].sort((a, b) => {
    const pa = personById.get(a.inviteId);
    const pb = personById.get(b.inviteId);
    return `${pa?.nom ?? ""} ${pa?.prenom ?? ""}`.localeCompare(
      `${pb?.nom ?? ""} ${pb?.prenom ?? ""}`,
      "fr",
      { sensitivity: "base" },
    );
  });

  return (
    <div className="flex flex-col gap-3">
      {editing ? (
        <ParticipationEditor
          battueId={battueId}
          invitePersons={invitePersons}
          usedIds={usedIds}
          participation={editing === "new" ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {invitePersons.length > 0 ? (
              <Button
                block
                variant="secondary"
                onClick={() => setEditing("new")}
              >
                <UserPlus />
                Ajouter un invité
              </Button>
            ) : null}
            <Button
              block
              variant={invitePersons.length > 0 ? "ghost" : "secondary"}
              onClick={() => setCreating(true)}
            >
              <Plus />
              Ajouter un nouvel invité
            </Button>
          </div>
          {participations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun invité pour cette battue.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sorted.map((part) => {
                const person = personById.get(part.inviteId);
                return (
                  <li
                    key={part.id}
                    className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {person ? fullName(person) : "Invité"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="muted">
                          {part.role === "POSTE" ? "Posté" : "Traqueur"}
                        </Badge>
                        {person?.parrainPrenom ? (
                          <span>
                            Invité par {person.parrainNom?.toUpperCase()}{" "}
                            {person.parrainPrenom}
                          </span>
                        ) : null}
                        {part.signature ? (
                          <Badge variant="success">Signé</Badge>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Modifier"
                      onClick={() => setEditing(part)}
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

      <NewInviteDialog
        open={creating}
        onClose={() => setCreating(false)}
        cahierId={cahierId}
        parrains={parrains}
      />
    </div>
  );
}

/** Dialog de création d'un nouvel invité (personne du cahier), en ligne. */
function NewInviteDialog({
  open,
  onClose,
  cahierId,
  parrains,
}: {
  open: boolean;
  onClose: () => void;
  cahierId: string;
  parrains: ParrainOption[];
}) {
  const router = useRouter();
  const online = useOnline();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [parrain, setParrain] = useState("");
  const [numPermis, setNumPermis] = useState("");
  const [numValidation, setNumValidation] = useState("");
  const [numAssurance, setNumAssurance] = useState("");

  function reset() {
    setNom("");
    setPrenom("");
    setParrain("");
    setNumPermis("");
    setNumValidation("");
    setNumAssurance("");
    setError(null);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!nom.trim() || !prenom.trim()) {
      setError("Nom et prénom obligatoires.");
      return;
    }
    if (!parrain) {
      setError("Choisissez un parrain.");
      return;
    }
    startTransition(async () => {
      const res = await createInviteQuick({
        cahierId,
        parrain,
        nom: nom.trim(),
        prenom: prenom.trim(),
        numPermis: numPermis.trim(),
        numValidation: numValidation.trim(),
        numAssurance: numAssurance.trim(),
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      reset();
      onClose();
      // Rafraîchit l'instantané serveur pour rendre l'invité sélectionnable.
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nouvel invité"
      description="Créez un invité réutilisable sur les battues."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {!online ? (
          <p className="rounded-[var(--radius)] bg-muted p-2 text-sm text-muted-foreground">
            Une connexion est nécessaire pour créer un invité.
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom" required>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} />
          </Field>
          <Field label="Prénom" required>
            <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          </Field>
        </div>
        <Field label="Invité par" required>
          <Select value={parrain} onChange={(e) => setParrain(e.target.value)}>
            <option value="" disabled>
              — Choisir un parrain —
            </option>
            {parrains.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="N° de permis">
          <Input
            value={numPermis}
            onChange={(e) => setNumPermis(e.target.value)}
          />
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

        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}
        <Button type="submit" block disabled={pending || !online}>
          {pending ? "Création…" : "Créer l'invité"}
        </Button>
      </form>
    </Dialog>
  );
}

function ParticipationEditor({
  battueId,
  invitePersons,
  usedIds,
  participation,
  onDone,
}: {
  battueId: string;
  invitePersons: SyncInvitePerson[];
  usedIds: Set<string>;
  participation?: LocalInviteParticipation;
  onDone: () => void;
}) {
  const [inviteId, setInviteId] = useState(participation?.inviteId ?? "");
  const [role, setRole] = useState<"POSTE" | "TRAQUEUR">(
    participation?.role ?? "POSTE",
  );
  const [signature, setSignature] = useState<string | null>(
    participation?.signature ?? null,
  );
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Invités sélectionnables : ceux pas encore présents + l'invité en cours d'édition.
  const options = invitePersons.filter(
    (p) => !usedIds.has(p.id) || p.id === participation?.inviteId,
  );

  function save() {
    if (!inviteId) {
      setError("Choisissez un invité.");
      return;
    }
    upsertInviteParticipation(battueId, {
      id: participation?.id,
      inviteId,
      role,
      signature,
    });
    onDone();
  }

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-4">
      <Field label="Invité" required>
        <Select
          value={inviteId}
          onChange={(e) => setInviteId(e.target.value)}
          disabled={Boolean(participation)}
        >
          <option value="" disabled>
            — Choisir un invité —
          </option>
          {options.map((p) => (
            <option key={p.id} value={p.id}>
              {fullName(p)}
            </option>
          ))}
        </Select>
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
        {signature && !signing ? (
          <div className="flex items-center gap-3">
            <div className="flex h-20 flex-1 items-center justify-center rounded-[var(--radius)] border border-border bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signature}
                alt="Signature invité"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSigning(true)}
            >
              Modifier
            </Button>
          </div>
        ) : (
          <SignaturePad
            onSave={(url) => {
              setSignature(url);
              setSigning(false);
            }}
            onCancel={signature ? () => setSigning(false) : undefined}
            notice={SECURITY_NOTICE}
          />
        )}
      </Field>

      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Button onClick={save} block>
          {participation ? "Enregistrer" : "Ajouter l'invité"}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" block onClick={onDone}>
            Annuler
          </Button>
          {participation ? (
            <ConfirmDelete
              action={() => {
                removeInviteParticipation(battueId, participation.id);
                onDone();
              }}
              label="Retirer"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
