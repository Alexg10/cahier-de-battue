"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import { saveDelegation } from "./delegation-actions";

export function DelegationCard({
  battueId,
  presidentNom,
  delegueNom,
  territoire,
  saison,
  dateLongue,
  lieu,
  initialDelegant,
  initialDelegue,
}: {
  battueId: string;
  presidentNom: string;
  delegueNom: string;
  territoire: string;
  saison: string;
  dateLongue: string;
  lieu: string;
  initialDelegant: string | null;
  initialDelegue: string | null;
}) {
  const router = useRouter();
  const [delegant, setDelegant] = useState<string | null>(initialDelegant);
  const [delegue, setDelegue] = useState<string | null>(initialDelegue);
  const [open, setOpen] = useState<null | "delegant" | "delegue">(null);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty =
    delegant !== initialDelegant || delegue !== initialDelegue;

  function save() {
    if (!delegant || !delegue) return;
    startTransition(async () => {
      await saveDelegation({
        battueId,
        signatureDelegant: delegant,
        signatureDelegue: delegue,
      });
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-[var(--radius)] bg-muted p-3 text-sm leading-relaxed">
        Je soussigné <strong>{presidentNom}</strong>, responsable du territoire
        de chasse de <strong>{territoire || "…"}</strong>, donne délégation pour
        l'organisation de la battue à <strong>{delegueNom}</strong> pour la
        saison de chasse <strong>{saison}</strong> pour la journée du{" "}
        <strong>{dateLongue}</strong>. Les responsabilités inhérentes à
        l'organisation de la battue incombent au délégué. Fait à{" "}
        <strong>{lieu || "…"}</strong>.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <SignSlot
          label={`Le président (${presidentNom})`}
          value={delegant}
          onOpen={() => setOpen("delegant")}
        />
        <SignSlot
          label={`Le délégué (${delegueNom})`}
          value={delegue}
          onOpen={() => setOpen("delegue")}
        />
      </div>

      {open ? (
        <div className="rounded-[var(--radius)] border border-border p-3">
          <p className="mb-2 text-sm font-semibold">
            Signature —{" "}
            {open === "delegant"
              ? `Président (${presidentNom})`
              : `Délégué (${delegueNom})`}
          </p>
          <SignaturePad
            onSave={(url) => {
              if (open === "delegant") setDelegant(url);
              else setDelegue(url);
              setOpen(null);
              setSaved(false);
            }}
            onCancel={() => setOpen(null)}
          />
        </div>
      ) : null}

      <Button
        type="button"
        block
        onClick={save}
        disabled={!delegant || !delegue || pending || (!dirty && saved)}
      >
        {saved && !dirty ? (
          <>
            <Check /> Délégation enregistrée
          </>
        ) : pending ? (
          "Enregistrement…"
        ) : (
          "Enregistrer la délégation"
        )}
      </Button>
    </div>
  );
}

function SignSlot({
  label,
  value,
  onOpen,
}: {
  label: string;
  value: string | null;
  onOpen: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      {value ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex h-24 items-center justify-center rounded-[var(--radius)] border border-border bg-white p-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={`Signature ${label}`}
            className="max-h-full max-w-full object-contain"
          />
        </button>
      ) : (
        <Button type="button" variant="secondary" onClick={onOpen}>
          Signer
        </Button>
      )}
    </div>
  );
}
