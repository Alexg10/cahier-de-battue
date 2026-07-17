"use client";

import { useState } from "react";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import { useDelegation } from "./hooks";
import { saveDelegation } from "./sync";

export function OfflineDelegation({
  battueId,
  presidentNom,
  delegueNom,
  territoire,
  saison,
  dateLongue,
  lieu,
}: {
  battueId: string;
  presidentNom: string;
  delegueNom: string;
  territoire: string;
  saison: string;
  dateLongue: string;
  lieu: string;
}) {
  const deleg = useDelegation(battueId);
  const [open, setOpen] = useState<null | "delegant" | "delegue">(null);

  const delegant = deleg?.signatureDelegant ?? null;
  const delegue = deleg?.signatureDelegue ?? null;

  function set(which: "delegant" | "delegue", url: string) {
    saveDelegation(
      battueId,
      which === "delegant" ? url : delegant,
      which === "delegue" ? url : delegue,
    );
    setOpen(null);
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
            onSave={(url) => set(open, url)}
            onCancel={() => setOpen(null)}
          />
        </div>
      ) : null}
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
