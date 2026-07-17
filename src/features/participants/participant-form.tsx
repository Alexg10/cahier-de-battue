"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createParticipant,
  updateParticipant,
  type FormState,
} from "./actions";
import type { Participant } from "./queries";

export function ParticipantForm({
  cahierId,
  participant,
}: {
  cahierId: string;
  participant?: Participant;
}) {
  const action = participant ? updateParticipant : createParticipant;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );
  const [estChasseur, setEstChasseur] = useState(
    participant?.estChasseur ?? true,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cahierId" value={cahierId} />
      {participant ? (
        <input type="hidden" name="id" value={participant.id} />
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" htmlFor="prenom" required>
          <Input
            id="prenom"
            name="prenom"
            required
            defaultValue={participant?.prenom ?? ""}
            autoComplete="off"
          />
        </Field>
        <Field label="Nom" htmlFor="nom" required>
          <Input
            id="nom"
            name="nom"
            required
            defaultValue={participant?.nom ?? ""}
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
          defaultValue={participant?.telephone ?? ""}
          placeholder="06 12 34 56 78"
        />
      </Field>

      <label className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3">
        <input
          type="checkbox"
          name="estChasseur"
          checked={estChasseur}
          onChange={(e) => setEstChasseur(e.target.checked)}
          className="size-6 accent-primary"
        />
        <span className="text-sm font-medium">
          Chasseur
          <span className="block text-xs font-normal text-muted-foreground">
            Décochez pour un membre du bureau non chasseur (ex. secrétaire).
          </span>
        </span>
      </label>

      {estChasseur ? (
        <div className="grid gap-4">
          <p className="text-sm font-bold">État civil & coordonnées</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date de naissance" htmlFor="dateNaissance">
              <Input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                defaultValue={participant?.dateNaissance ?? ""}
              />
            </Field>
            <Field label="Lieu de naissance" htmlFor="lieuNaissance">
              <Input
                id="lieuNaissance"
                name="lieuNaissance"
                defaultValue={participant?.lieuNaissance ?? ""}
                autoComplete="off"
              />
            </Field>
          </div>
          <Field label="Adresse" htmlFor="adresse">
            <Input
              id="adresse"
              name="adresse"
              defaultValue={participant?.adresse ?? ""}
              autoComplete="off"
            />
          </Field>
          <Field label="E-mail" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              defaultValue={participant?.email ?? ""}
              autoComplete="off"
            />
          </Field>

          <p className="mt-2 text-sm font-bold">Permis de chasser</p>
          <Field label="N° de permis de chasser" htmlFor="numPermis">
            <Input
              id="numPermis"
              name="numPermis"
              defaultValue={participant?.numPermis ?? ""}
              autoComplete="off"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Délivré le" htmlFor="permisDelivreLe">
              <Input
                id="permisDelivreLe"
                name="permisDelivreLe"
                type="date"
                defaultValue={participant?.permisDelivreLe ?? ""}
              />
            </Field>
            <Field label="Délivré à" htmlFor="permisDelivreA">
              <Input
                id="permisDelivreA"
                name="permisDelivreA"
                defaultValue={participant?.permisDelivreA ?? ""}
                autoComplete="off"
              />
            </Field>
          </div>
          <Field label="N° de validation annuelle" htmlFor="numValidation">
            <Input
              id="numValidation"
              name="numValidation"
              defaultValue={participant?.numValidation ?? ""}
              autoComplete="off"
            />
          </Field>
          <Field label="Type de validation" htmlFor="typeValidation">
            <Select
              id="typeValidation"
              name="typeValidation"
              defaultValue={participant?.typeValidation ?? ""}
            >
              <option value="">—</option>
              <option value="DEPARTEMENTALE">Départementale</option>
              <option value="BI_DEPARTEMENTALE">Bi-départementale</option>
              <option value="NATIONALE">Nationale</option>
            </Select>
          </Field>
          <Field label="Timbre grand gibier" htmlFor="timbreGrandGibier">
            <Select
              id="timbreGrandGibier"
              name="timbreGrandGibier"
              defaultValue={participant?.timbreGrandGibier ?? ""}
            >
              <option value="">Aucun</option>
              <option value="NATIONAL">National</option>
              <option value="DEPARTEMENTAL">Départemental</option>
            </Select>
          </Field>

          <p className="mt-2 text-sm font-bold">Assurance</p>
          <Field label="Nom de la compagnie" htmlFor="nomAssurance">
            <Input
              id="nomAssurance"
              name="nomAssurance"
              defaultValue={participant?.nomAssurance ?? ""}
              autoComplete="off"
            />
          </Field>
          <Field
            label="Adresse de l'agent ou du courtier"
            htmlFor="adresseAssurance"
          >
            <Input
              id="adresseAssurance"
              name="adresseAssurance"
              defaultValue={participant?.adresseAssurance ?? ""}
              autoComplete="off"
            />
          </Field>
          <Field label="N° de contrat d'assurance" htmlFor="numAssurance">
            <Input
              id="numAssurance"
              name="numAssurance"
              defaultValue={participant?.numAssurance ?? ""}
              autoComplete="off"
            />
          </Field>
        </div>
      ) : null}

      {state?.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending
          ? "Enregistrement…"
          : participant
            ? "Enregistrer"
            : "Ajouter le participant"}
      </Button>
    </form>
  );
}
