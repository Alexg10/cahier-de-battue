"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Participant } from "@/features/participants/queries";
import { createInvite, updateInvite } from "./actions";
import type { Invite } from "./queries";

export function InviteForm({
  battueId,
  participants,
  invite,
  backHref,
}: {
  battueId: string;
  participants: Participant[];
  invite?: Invite;
  backHref: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"POSTE" | "TRAQUEUR">(
    invite?.role ?? "POSTE",
  );
  const [signature, setSignature] = useState<string | null>(
    invite?.signature ?? null,
  );
  const [signing, setSigning] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      battueId,
      participantId: String(fd.get("participantId") ?? ""),
      nom: String(fd.get("nom") ?? ""),
      prenom: String(fd.get("prenom") ?? ""),
      numPermis: String(fd.get("numPermis") ?? ""),
      numValidation: String(fd.get("numValidation") ?? ""),
      numAssurance: String(fd.get("numAssurance") ?? ""),
      role,
      signature,
    };
    startTransition(async () => {
      const res = invite
        ? await updateInvite(invite.id, input)
        : await createInvite(input);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push(backHref);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" htmlFor="prenom" required>
          <Input id="prenom" name="prenom" required defaultValue={invite?.prenom ?? ""} />
        </Field>
        <Field label="Nom" htmlFor="nom" required>
          <Input id="nom" name="nom" required defaultValue={invite?.nom ?? ""} />
        </Field>
      </div>

      <Field
        label="Invité par (membre)"
        htmlFor="participantId"
        required
        hint="Chaque invité est rattaché à un membre de la chasse."
      >
        <Select
          id="participantId"
          name="participantId"
          required
          defaultValue={invite?.participantId ?? ""}
        >
          <option value="" disabled>
            — Choisir un membre —
          </option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.prenom} {p.nom}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="N° de permis" htmlFor="numPermis">
        <Input id="numPermis" name="numPermis" defaultValue={invite?.numPermis ?? ""} />
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

      <Field label="Poste">
        <div className="inline-flex overflow-hidden rounded-full border border-border">
          {(["POSTE", "TRAQUEUR"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-colors",
                role === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground",
              )}
            >
              {r === "POSTE" ? "Posté" : "Traqueur"}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Signature de l'invité">
        {signing ? (
          <SignaturePad
            onSave={(url) => {
              setSignature(url);
              setSigning(false);
            }}
            onCancel={() => setSigning(false)}
          />
        ) : signature ? (
          <div className="flex items-center gap-3">
            <div className="flex h-20 flex-1 items-center justify-center rounded-[var(--radius)] border border-border bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signature}
                alt="Signature invité"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <Button type="button" variant="secondary" onClick={() => setSigning(true)}>
              Modifier
            </Button>
          </div>
        ) : (
          <Button type="button" variant="secondary" onClick={() => setSigning(true)}>
            Faire signer l'invité
          </Button>
        )}
      </Field>

      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? "Enregistrement…" : invite ? "Enregistrer" : "Ajouter l'invité"}
      </Button>
    </form>
  );
}
