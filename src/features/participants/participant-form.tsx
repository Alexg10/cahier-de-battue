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
import type { ParrainPersonne, Participant } from "./queries";

export function ParticipantForm({
  cahierId,
  participant,
  parrains = { participants: [], proprietaires: [] },
}: {
  cahierId: string;
  participant?: Participant;
  parrains?: { participants: ParrainPersonne[]; proprietaires: ParrainPersonne[] };
}) {
  const action = participant ? updateParticipant : createParticipant;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );
  const [type, setType] = useState<"CHASSEUR" | "TRAQUEUR" | "ACCOMPAGNANT">(
    participant?.type ?? "CHASSEUR",
  );
  const estChasseur = type === "CHASSEUR";
  const [parrain, setParrain] = useState(
    participant?.parrainType && participant?.parrainId
      ? `${participant.parrainType}:${participant.parrainId}`
      : "",
  );
  const hasParrains =
    parrains.participants.length > 0 || parrains.proprietaires.length > 0;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cahierId" value={cahierId} />
      {participant ? (
        <input type="hidden" name="id" value={participant.id} />
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom" htmlFor="nom" required>
          <Input
            id="nom"
            name="nom"
            required
            defaultValue={participant?.nom ?? ""}
            autoComplete="off"
          />
        </Field>
        <Field label="Prénom" htmlFor="prenom" required>
          <Input
            id="prenom"
            name="prenom"
            required
            defaultValue={participant?.prenom ?? ""}
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
          placeholder="06 XX XX XX XX"
        />
      </Field>

      <Field
        label="Type de participant"
        htmlFor="type"
        hint="Le permis n'est demandé que pour les chasseurs. Le rôle du jour (posté/traqueur) reste modifiable au pointage."
      >
        <Select
          id="type"
          name="type"
          value={type}
          onChange={(e) =>
            setType(e.target.value as "CHASSEUR" | "TRAQUEUR" | "ACCOMPAGNANT")
          }
        >
          <option value="CHASSEUR">Chasseur</option>
          <option value="TRAQUEUR">Traqueur</option>
          <option value="ACCOMPAGNANT">Accompagnant</option>
        </Select>
      </Field>

      {hasParrains ? (
        <Field
          label="Invité par"
          htmlFor="parrain"
          hint="Facultatif : le participant ou le propriétaire qui l'a invité."
        >
          <Select
            id="parrain"
            name="parrain"
            value={parrain}
            onChange={(e) => setParrain(e.target.value)}
          >
            <option value="">— Aucun —</option>
            {parrains.participants.length > 0 ? (
              <optgroup label="Participants">
                {parrains.participants.map((p) => (
                  <option key={p.id} value={`PARTICIPANT:${p.id}`}>
                    {p.nom.toUpperCase()} {p.prenom}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {parrains.proprietaires.length > 0 ? (
              <optgroup label="Propriétaires">
                {parrains.proprietaires.map((p) => (
                  <option key={p.id} value={`PROPRIETAIRE:${p.id}`}>
                    {p.nom.toUpperCase()} {p.prenom}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </Select>
        </Field>
      ) : null}

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
      </div>

      {estChasseur ? (
        <div className="grid gap-4">
          <p className="text-sm font-bold">Permis de chasser</p>
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
