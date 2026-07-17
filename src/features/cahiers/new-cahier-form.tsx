"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createCahier, type FormState } from "./actions";

export function NewCahierForm({ saisonDefaut }: { saisonDefaut: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createCahier,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nom de la société de chasse" htmlFor="nom" required>
        <Input id="nom" name="nom" required placeholder="ACCA de …" />
      </Field>
      <Field
        label="Territoire de chasse"
        htmlFor="territoire"
        hint="Utilisé sur la délégation de pouvoir et les exports."
      >
        <Input
          id="territoire"
          name="territoire"
          placeholder="Nom / commune du territoire"
        />
      </Field>
      <Field label="Saison" htmlFor="saison" required hint="Format 2025/2026.">
        <Input
          id="saison"
          name="saison"
          required
          inputMode="numeric"
          defaultValue={saisonDefaut}
          pattern="\d{4}/\d{4}"
        />
      </Field>

      <Field
        label="Importer des participants (facultatif)"
        htmlFor="participantsFile"
        hint="Fichier CSV ou Excel (.xlsx). Colonnes reconnues : nom, prenom, telephone, permis, mail. « nom » et « prenom » sont obligatoires."
      >
        <Input
          id="participantsFile"
          name="participantsFile"
          type="file"
          accept=".csv,.xlsx"
          className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-semibold"
        />
      </Field>

      {state?.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? "Création…" : "Créer le cahier"}
      </Button>
    </form>
  );
}
