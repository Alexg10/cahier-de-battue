"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { LocalPrelevement } from "./db";
import { useInvites, usePointages, usePrelevements } from "./hooks";
import { removePrelevement, upsertPrelevement } from "./sync";
import type { SyncParticipant } from "./types";

const SEXE_LABEL: Record<string, string> = {
  MALE: "Mâle",
  FEMELLE: "Femelle",
  INDETERMINE: "Indéterminé",
};

export function OfflinePrelevements({
  battueId,
  especes,
  chasseurs,
}: {
  battueId: string;
  especes: string[];
  chasseurs: SyncParticipant[];
}) {
  const prelevements = usePrelevements(battueId) ?? [];
  const invites = useInvites(battueId) ?? [];
  const pointages = usePointages(battueId) ?? [];
  const [editing, setEditing] = useState<null | "new" | LocalPrelevement>(null);

  // Tireurs proposés : uniquement les chasseurs ayant signé le pointage.
  const signedIds = new Set(pointages.map((p) => p.participantId));
  const chasseursSignes = chasseurs.filter((c) => signedIds.has(c.id));

  function tireurNom(p: LocalPrelevement) {
    if (p.tireurParticipantId) {
      const c = chasseurs.find((x) => x.id === p.tireurParticipantId);
      return c ? `${c.nom.toUpperCase()} ${c.prenom}` : null;
    }
    if (p.tireurInviteId) {
      const i = invites.find((x) => x.id === p.tireurInviteId);
      return i ? `${i.nom.toUpperCase()} ${i.prenom} (invité)` : null;
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {editing ? (
        <PrelevementEditor
          battueId={battueId}
          especes={especes}
          chasseurs={chasseursSignes}
          invites={invites.map((i) => ({
            id: i.id,
            nom: i.nom,
            prenom: i.prenom,
          }))}
          prelevement={editing === "new" ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <>
          <Button block variant="secondary" onClick={() => setEditing("new")}>
            <Plus />
            Ajouter un prélèvement
          </Button>
          {prelevements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun animal prélevé.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {prelevements.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {p.espece}
                      {p.numBracelet ? (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {p.numBracelet}
                        </span>
                      ) : null}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                      {p.sexe ? (
                        <Badge variant="muted">{SEXE_LABEL[p.sexe]}</Badge>
                      ) : null}
                      {p.age ? <Badge variant="muted">{p.age}</Badge> : null}
                      {p.poids ? (
                        <Badge variant="muted">{p.poids} kg</Badge>
                      ) : null}
                      {tireurNom(p) ? <span>Tireur : {tireurNom(p)}</span> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Modifier"
                    onClick={() => setEditing(p)}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function PrelevementEditor({
  battueId,
  especes,
  chasseurs,
  invites,
  prelevement,
  onDone,
}: {
  battueId: string;
  especes: string[];
  chasseurs: SyncParticipant[];
  invites: { id: string; nom: string; prenom: string }[];
  prelevement?: LocalPrelevement;
  onDone: () => void;
}) {
  const [espece, setEspece] = useState(prelevement?.espece ?? "");
  const [numBracelet, setNumBracelet] = useState(
    prelevement?.numBracelet ?? "",
  );
  const [age, setAge] = useState(prelevement?.age ?? "");
  const [sexe, setSexe] = useState<string>(prelevement?.sexe ?? "MALE");
  const [poids, setPoids] = useState(prelevement?.poids ?? "");
  const [tireur, setTireur] = useState(
    prelevement?.tireurParticipantId
      ? `p:${prelevement.tireurParticipantId}`
      : prelevement?.tireurInviteId
        ? `i:${prelevement.tireurInviteId}`
        : "",
  );
  const [error, setError] = useState<string | null>(null);

  function save() {
    if (!espece.trim()) {
      setError("L'espèce est obligatoire.");
      return;
    }
    const poidsVal = poids.trim()
      ? String(Number(poids.replace(",", ".")).toFixed(2))
      : null;
    upsertPrelevement(battueId, {
      id: prelevement?.id,
      espece: espece.trim(),
      numBracelet: numBracelet.trim() || null,
      age: age.trim() || null,
      sexe: (sexe || null) as LocalPrelevement["sexe"],
      poids: poidsVal,
      tireurParticipantId: tireur.startsWith("p:") ? tireur.slice(2) : null,
      tireurInviteId: tireur.startsWith("i:") ? tireur.slice(2) : null,
    });
    onDone();
  }

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-4">
      <Field label="Espèce" required>
        {especes.length > 0 ? (
          <Select value={espece} onChange={(e) => setEspece(e.target.value)}>
            <option value="" disabled>
              — Choisir —
            </option>
            {especes.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
        ) : (
          <Input value={espece} onChange={(e) => setEspece(e.target.value)} />
        )}
      </Field>
      <Field label="N° de bracelet">
        <Input
          value={numBracelet}
          onChange={(e) => setNumBracelet(e.target.value)}
          placeholder="Ex. BR-2025-001"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Âge">
          <Input value={age} onChange={(e) => setAge(e.target.value)} />
        </Field>
        <Field label="Sexe">
          <Select value={sexe} onChange={(e) => setSexe(e.target.value)}>
            <option value="">—</option>
            <option value="MALE">Mâle</option>
            <option value="FEMELLE">Femelle</option>
            <option value="INDETERMINE">Indéterminé</option>
          </Select>
        </Field>
      </div>
      <Field label="Poids (kg)">
        <Input
          value={poids}
          inputMode="decimal"
          onChange={(e) => setPoids(e.target.value)}
          placeholder="Ex. 18,5"
        />
      </Field>
      <Field label="Tireur">
        <Select value={tireur} onChange={(e) => setTireur(e.target.value)}>
          <option value="">— Non renseigné —</option>
          {chasseurs.length > 0 ? (
            <optgroup label="Participants">
              {chasseurs.map((p) => (
                <option key={p.id} value={`p:${p.id}`}>
                  {p.nom.toUpperCase()} {p.prenom}
                </option>
              ))}
            </optgroup>
          ) : null}
          {invites.length > 0 ? (
            <optgroup label="Invités">
              {invites.map((i) => (
                <option key={i.id} value={`i:${i.id}`}>
                  {i.nom.toUpperCase()} {i.prenom}
                </option>
              ))}
            </optgroup>
          ) : null}
        </Select>
      </Field>

      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Button onClick={save} block>
          {prelevement ? "Enregistrer" : "Ajouter le prélèvement"}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" block onClick={onDone}>
            Annuler
          </Button>
          {prelevement ? (
            <ConfirmDelete
              action={() => {
                removePrelevement(battueId, prelevement.id);
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
