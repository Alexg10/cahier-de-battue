"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createInvite, updateInvite, type FormState } from "./actions";
import type { CahierInvite } from "./queries";

/** Option de parrain : un chasseur ou un propriétaire. */
export type ParrainOption = { value: string; label: string };

export function InviteForm({
  cahierId,
  parrains,
  invite,
}: {
  cahierId: string;
  parrains: ParrainOption[];
  invite?: CahierInvite;
}) {
  const action = invite ? updateInvite : createInvite;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );
  const parrainDefault = invite
    ? `${invite.parrainType}:${invite.parrainId}`
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cahierId" value={cahierId} />
      {invite ? <input type="hidden" name="id" value={invite.id} /> : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom" htmlFor="nom" required>
          <Input
            id="nom"
            name="nom"
            required
            defaultValue={invite?.nom ?? ""}
            autoComplete="off"
          />
        </Field>
        <Field label="Prénom" htmlFor="prenom" required>
          <Input
            id="prenom"
            name="prenom"
            required
            defaultValue={invite?.prenom ?? ""}
            autoComplete="off"
          />
        </Field>
      </div>

      <Field
        label="Invité par"
        htmlFor="parrain"
        required
        hint="Chaque invité est parrainé par un chasseur ou un propriétaire."
      >
        <Select id="parrain" name="parrain" required defaultValue={parrainDefault}>
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

      <Field label="N° de permis" htmlFor="numPermis">
        <Input
          id="numPermis"
          name="numPermis"
          defaultValue={invite?.numPermis ?? ""}
        />
      </Field>
      <Field label="N° de validation annuelle" htmlFor="numValidation">
        <Input
          id="numValidation"
          name="numValidation"
          defaultValue={invite?.numValidation ?? ""}
        />
      </Field>
      <Field label="N° de contrat d'assurance" htmlFor="numAssurance">
        <Input
          id="numAssurance"
          name="numAssurance"
          defaultValue={invite?.numAssurance ?? ""}
        />
      </Field>

      {state?.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending
          ? "Enregistrement…"
          : invite
            ? "Enregistrer"
            : "Ajouter l'invité"}
      </Button>
    </form>
  );
}
