"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createProprietaire,
  updateProprietaire,
  type FormState,
} from "./actions";
import type { Proprietaire } from "./queries";

/** Chasseur proposé pour pré-remplir un propriétaire (un chasseur peut l'être). */
export type ChasseurOption = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
};

/** Participant proposé comme référent (contact) d'un propriétaire. */
export type ReferentOption = { id: string; nom: string; prenom: string };

export function ProprietaireForm({
  cahierId,
  proprietaire,
  chasseurs = [],
  referents = [],
}: {
  cahierId: string;
  proprietaire?: Proprietaire;
  chasseurs?: ChasseurOption[];
  referents?: ReferentOption[];
}) {
  const action = proprietaire ? updateProprietaire : createProprietaire;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  // Champs contrôlés pour permettre le pré-remplissage depuis un chasseur.
  const [prenom, setPrenom] = useState(proprietaire?.prenom ?? "");
  const [nom, setNom] = useState(proprietaire?.nom ?? "");
  const [telephone, setTelephone] = useState(proprietaire?.telephone ?? "");
  // Lien vers un participant chasseur (chaîne vide = non lié).
  const [participantId, setParticipantId] = useState(
    proprietaire?.participantId ?? "",
  );
  // Référent (participant contact), indépendant du lien chasseur.
  const [referentId, setReferentId] = useState(proprietaire?.referentId ?? "");

  function choisirChasseur(id: string) {
    setParticipantId(id);
    const c = chasseurs.find((x) => x.id === id);
    if (!c) return; // désélection : on garde les champs déjà saisis.
    setPrenom(c.prenom);
    setNom(c.nom);
    setTelephone(c.telephone ?? "");
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cahierId" value={cahierId} />
      <input type="hidden" name="participantId" value={participantId} />
      <input type="hidden" name="referentId" value={referentId} />
      {proprietaire ? (
        <input type="hidden" name="id" value={proprietaire.id} />
      ) : null}

      {chasseurs.length > 0 ? (
        <Field
          label="Lier à un chasseur"
          htmlFor="chasseur"
          hint="Facultatif : le propriétaire est aussi chasseur ; évite les doublons dans la distribution."
        >
          <Select
            id="chasseur"
            value={participantId}
            onChange={(e) => choisirChasseur(e.target.value)}
          >
            <option value="">— Aucun (propriétaire seul) —</option>
            {chasseurs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom.toUpperCase()} {c.prenom}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom" htmlFor="nom" required>
          <Input
            id="nom"
            name="nom"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field label="Prénom" htmlFor="prenom" required>
          <Input
            id="prenom"
            name="prenom"
            required
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
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
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="06 XX XX XX XX"
        />
      </Field>

      {referents.length > 0 ? (
        <Field
          label="Référent"
          htmlFor="referent"
          hint="Participant contact du propriétaire (ex. pour lui remettre la viande)."
        >
          <Select
            id="referent"
            value={referentId}
            onChange={(e) => setReferentId(e.target.value)}
          >
            <option value="">— Aucun —</option>
            {referents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nom.toUpperCase()} {r.prenom}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

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
