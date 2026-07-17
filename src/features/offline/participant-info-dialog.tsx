"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SyncParticipant } from "./types";
import { updateParticipantInfo } from "./sync";

/** Dialogue de correction des infos d'un participant (permis, assurance, tél.). */
export function ParticipantInfoDialog({
  battueId,
  participant,
  onClose,
}: {
  battueId: string;
  participant: SyncParticipant | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={Boolean(participant)}
      onClose={onClose}
      title={
        participant
          ? `${participant.nom.toUpperCase()} ${participant.prenom}`
          : undefined
      }
      description="Corriger les informations en cas d'erreur."
    >
      {participant ? (
        // `key` : réinitialise les champs à chaque participant édité.
        <EditForm
          key={participant.id}
          battueId={battueId}
          participant={participant}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  );
}

function EditForm({
  battueId,
  participant,
  onClose,
}: {
  battueId: string;
  participant: SyncParticipant;
  onClose: () => void;
}) {
  const [telephone, setTelephone] = useState(participant.telephone ?? "");
  const [numPermis, setNumPermis] = useState(participant.numPermis ?? "");
  const [numValidation, setNumValidation] = useState(
    participant.numValidation ?? "",
  );
  const [nomAssurance, setNomAssurance] = useState(
    participant.nomAssurance ?? "",
  );
  const [numAssurance, setNumAssurance] = useState(
    participant.numAssurance ?? "",
  );

  const trim = (s: string) => {
    const v = s.trim();
    return v.length ? v : null;
  };

  function handleSave() {
    updateParticipantInfo(battueId, participant.id, {
      telephone: trim(telephone),
      numPermis: trim(numPermis),
      numValidation: trim(numValidation),
      nomAssurance: trim(nomAssurance),
      numAssurance: trim(numAssurance),
    });
    onClose();
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Téléphone" htmlFor="edit-telephone">
        <Input
          id="edit-telephone"
          type="tel"
          inputMode="tel"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="06 12 34 56 78"
        />
      </Field>
      <Field label="N° de permis de chasser" htmlFor="edit-permis">
        <Input
          id="edit-permis"
          value={numPermis}
          onChange={(e) => setNumPermis(e.target.value)}
          autoComplete="off"
        />
      </Field>
      <Field label="N° de validation annuelle" htmlFor="edit-validation">
        <Input
          id="edit-validation"
          value={numValidation}
          onChange={(e) => setNumValidation(e.target.value)}
          autoComplete="off"
        />
      </Field>
      <Field label="Nom de l'assurance" htmlFor="edit-nom-assurance">
        <Input
          id="edit-nom-assurance"
          value={nomAssurance}
          onChange={(e) => setNomAssurance(e.target.value)}
          autoComplete="off"
        />
      </Field>
      <Field label="N° d'assurance annuelle" htmlFor="edit-num-assurance">
        <Input
          id="edit-num-assurance"
          value={numAssurance}
          onChange={(e) => setNumAssurance(e.target.value)}
          autoComplete="off"
        />
      </Field>

      <div className="flex gap-2">
        <Button variant="secondary" block onClick={onClose}>
          Annuler
        </Button>
        <Button block onClick={handleSave}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
