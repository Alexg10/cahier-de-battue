"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createProprietaire,
  updateProprietaire,
  type FormState,
} from "./actions";
import type { Proprietaire } from "./queries";

export function ProprietaireForm({
  cahierId,
  proprietaire,
}: {
  cahierId: string;
  proprietaire?: Proprietaire;
}) {
  const action = proprietaire ? updateProprietaire : createProprietaire;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cahierId" value={cahierId} />
      {proprietaire ? (
        <input type="hidden" name="id" value={proprietaire.id} />
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" htmlFor="prenom" required>
          <Input
            id="prenom"
            name="prenom"
            required
            defaultValue={proprietaire?.prenom ?? ""}
            autoComplete="off"
          />
        </Field>
        <Field label="Nom" htmlFor="nom" required>
          <Input
            id="nom"
            name="nom"
            required
            defaultValue={proprietaire?.nom ?? ""}
            autoComplete="off"
          />
        </Field>
      </div>

      <Field label="Téléphone" htmlFor="telephone">
        <Input
          id="telephone"
          name="telephone"
          type="tel"
          inputMode="tel"
          defaultValue={proprietaire?.telephone ?? ""}
          placeholder="06 12 34 56 78"
        />
      </Field>

      {state?.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending
          ? "Enregistrement…"
          : proprietaire
            ? "Enregistrer"
            : "Ajouter le propriétaire"}
      </Button>
    </form>
  );
}
