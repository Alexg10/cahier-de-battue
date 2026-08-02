"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createPrelevement,
  updatePrelevement,
  type FormState,
} from "./actions";
import type { Prelevement } from "./queries";

type Personne = { id: string; nom: string; prenom: string };

export function PrelevementForm({
  battueId,
  especes,
  chasseurs,
  invites,
  prelevement,
}: {
  battueId: string;
  especes: string[];
  chasseurs: Personne[];
  invites: Personne[];
  prelevement?: Prelevement;
}) {
  const action = prelevement ? updatePrelevement : createPrelevement;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  const tireurDefaut = prelevement?.tireurParticipantId
    ? `p:${prelevement.tireurParticipantId}`
    : prelevement?.tireurInviteId
      ? `i:${prelevement.tireurInviteId}`
      : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="battueId" value={battueId} />
      {prelevement ? (
        <input type="hidden" name="id" value={prelevement.id} />
      ) : null}

      <Field label="Espèce" htmlFor="espece" required>
        {especes.length > 0 ? (
          <Select
            id="espece"
            name="espece"
            required
            defaultValue={prelevement?.espece ?? ""}
          >
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
          <Input
            id="espece"
            name="espece"
            required
            defaultValue={prelevement?.espece ?? ""}
          />
        )}
      </Field>

      <Field label="N° de bracelet" htmlFor="numBracelet">
        <Input
          id="numBracelet"
          name="numBracelet"
          defaultValue={prelevement?.numBracelet ?? ""}
          placeholder="Ex. BR-2025-001"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Âge" htmlFor="age">
          <Input
            id="age"
            name="age"
            defaultValue={prelevement?.age ?? ""}
            placeholder="Jeune, adulte…"
          />
        </Field>
        <Field label="Sexe" htmlFor="sexe">
          <Select id="sexe" name="sexe" defaultValue={prelevement?.sexe ?? ""}>
            <option value="">—</option>
            <option value="MALE">Mâle</option>
            <option value="FEMELLE">Femelle</option>
            <option value="INDETERMINE">Indéterminé</option>
          </Select>
        </Field>
      </div>

      <Field label="Poids (kg)" htmlFor="poids">
        <Input
          id="poids"
          name="poids"
          type="text"
          inputMode="decimal"
          defaultValue={prelevement?.poids ?? ""}
          placeholder="Ex. 18,5"
        />
      </Field>

      <Field label="Tireur" htmlFor="tireur">
        <Select id="tireur" name="tireur" defaultValue={tireurDefaut}>
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

      {state?.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending
          ? "Enregistrement…"
          : prelevement
            ? "Enregistrer"
            : "Ajouter le prélèvement"}
      </Button>
    </form>
  );
}
