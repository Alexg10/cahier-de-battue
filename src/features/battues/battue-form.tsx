"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Participant } from "@/features/participants/queries";
import { createBattue, updateBattue, type FormState } from "./actions";
import type { Battue } from "./queries";

export function BattueForm({
  cahierId,
  participants,
  especes,
  presidentId,
  dateDefaut,
  battue,
}: {
  cahierId: string;
  participants: Participant[];
  especes: string[];
  presidentId: string | null;
  dateDefaut: string;
  battue?: Battue;
}) {
  const action = battue ? updateBattue : createBattue;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  const especesJour = new Set(battue?.especesJour ?? []);
  const responsableDefaut = battue?.responsableId ?? presidentId ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cahierId" value={cahierId} />
      {battue ? <input type="hidden" name="id" value={battue.id} /> : null}

      <Field label="Date" htmlFor="date" required>
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={battue?.date ?? dateDefaut}
        />
      </Field>

      <Field label="Lieu" htmlFor="lieu">
        <Input
          id="lieu"
          name="lieu"
          defaultValue={battue?.lieu ?? ""}
          placeholder="Parcelle, secteur…"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Heure de début" htmlFor="heureDebut">
          <Input
            id="heureDebut"
            name="heureDebut"
            type="time"
            defaultValue={battue?.heureDebut?.slice(0, 5) ?? "08:00"}
          />
        </Field>
        <Field label="Heure de fin" htmlFor="heureFin">
          <Input
            id="heureFin"
            name="heureFin"
            type="time"
            defaultValue={battue?.heureFin?.slice(0, 5) ?? "13:00"}
          />
        </Field>
      </div>

      <Field
        label="Responsable de battue"
        htmlFor="responsableId"
        hint="Par défaut le président. Un autre responsable génère une délégation."
      >
        <Select
          id="responsableId"
          name="responsableId"
          defaultValue={responsableDefaut}
        >
          <option value="">— À désigner —</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.prenom} {p.nom}
              {p.id === presidentId ? " (président)" : ""}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">
          Espèces chassées ce jour
        </legend>
        {especes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune espèce définie dans les réglages du cahier.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {especes.map((e) => (
              <label
                key={e}
                className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-card px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  name="especes"
                  value={e}
                  defaultChecked={especesJour.has(e)}
                  className="size-5 accent-primary"
                />
                <span className="text-sm">{e}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {state?.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending
          ? "Enregistrement…"
          : battue
            ? "Enregistrer"
            : "Créer la battue"}
      </Button>
    </form>
  );
}
