"use client";

import { Check, PenLine, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SignaturePad } from "@/components/signature-pad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Participant } from "@/features/participants/queries";
import type { PointageRow } from "./queries";
import { removePointage, setPointageRole, signPointage } from "./actions";

const ROLE_LABEL = {
  POSTE: "Posté",
  TRAQUEUR: "Traqueur",
  ACCOMPAGNANT: "Accompagnant",
} as const;

export function PointageSection({
  battueId,
  chasseurs,
  pointages,
}: {
  battueId: string;
  chasseurs: Participant[];
  pointages: PointageRow[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [role, setRole] = useState<"POSTE" | "TRAQUEUR" | "ACCOMPAGNANT">("POSTE");
  const [pending, startTransition] = useTransition();

  const byId = new Map(pointages.map((p) => [p.participantId, p]));
  const signedCount = pointages.filter((p) => p.hasSignature).length;

  function openSign(id: string, currentRole?: "POSTE" | "TRAQUEUR" | "ACCOMPAGNANT") {
    setRole(currentRole ?? "POSTE");
    setOpenId(id);
  }

  function handleSave(participantId: string, dataUrl: string) {
    startTransition(async () => {
      await signPointage({ battueId, participantId, signature: dataUrl, role });
      setOpenId(null);
      router.refresh();
    });
  }

  function handleRole(participantId: string, r: "POSTE" | "TRAQUEUR" | "ACCOMPAGNANT") {
    startTransition(async () => {
      await setPointageRole({ battueId, participantId, role: r });
      router.refresh();
    });
  }

  function handleRemove(participantId: string) {
    startTransition(async () => {
      await removePointage({ battueId, participantId });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {signedCount} / {chasseurs.length} chasseur
        {chasseurs.length > 1 ? "s" : ""} ont signé.
      </p>
      <ul className="flex flex-col gap-2">
        {chasseurs.map((p) => {
          const pt = byId.get(p.id);
          const signed = pt?.hasSignature;
          const isOpen = openId === p.id;
          return (
            <li
              key={p.id}
              className="rounded-[var(--radius)] border border-border bg-card"
            >
              <div className="flex items-center gap-3 p-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    signed
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {signed ? (
                    <Check className="size-5" />
                  ) : (
                    <PenLine className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {p.nom.toUpperCase()} {p.prenom}
                  </p>
                  {signed ? (
                    <Badge variant="default">{ROLE_LABEL[pt.role]}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      À faire signer
                    </span>
                  )}
                </div>
                {signed ? (
                  <button
                    type="button"
                    aria-label="Annuler le pointage"
                    onClick={() => handleRemove(p.id)}
                    disabled={pending}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-5" />
                  </button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => openSign(p.id)}
                    disabled={pending}
                  >
                    Signer
                  </Button>
                )}
              </div>

              {signed && !isOpen ? (
                <div className="flex items-center gap-2 border-t border-border px-3 py-2">
                  <span className="text-xs text-muted-foreground">Rôle :</span>
                  <RoleToggle
                    value={pt.role}
                    onChange={(r) => handleRole(p.id, r)}
                    disabled={pending}
                  />
                  <button
                    type="button"
                    onClick={() => openSign(p.id, pt.role)}
                    className="ml-auto text-xs font-semibold text-primary hover:underline"
                  >
                    Re-signer
                  </button>
                </div>
              ) : null}

              {isOpen ? (
                <div className="border-t border-border p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm font-semibold">Rôle :</span>
                    <RoleToggle value={role} onChange={setRole} />
                  </div>
                  <SignaturePad
                    saving={pending}
                    onSave={(url) => handleSave(p.id, url)}
                    onCancel={() => setOpenId(null)}
                    saveLabel={`Valider — ${p.nom.toUpperCase()} ${p.prenom}`}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RoleToggle({
  value,
  onChange,
  disabled,
}: {
  value: "POSTE" | "TRAQUEUR" | "ACCOMPAGNANT";
  onChange: (r: "POSTE" | "TRAQUEUR" | "ACCOMPAGNANT") => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-border">
      {(["POSTE", "TRAQUEUR"] as const).map((r) => (
        <button
          key={r}
          type="button"
          disabled={disabled}
          onClick={() => onChange(r)}
          className={cn(
            "px-3 py-1 text-xs font-semibold transition-colors",
            value === r
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground",
          )}
        >
          {ROLE_LABEL[r]}
        </button>
      ))}
    </div>
  );
}
