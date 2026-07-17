"use client";

import { FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { importParticipants, type ImportState } from "./actions";

export function ImportParticipantsForm({ cahierId }: { cahierId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ImportState, FormData>(
    importParticipants,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Rafraîchit la liste (composant serveur) après un import réussi.
  useEffect(() => {
    if (state?.imported != null) router.refresh();
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="cahierId" value={cahierId} />
      <label
        className={cn(
          "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius)] border border-border bg-card px-5 text-base font-semibold text-foreground transition-colors hover:bg-muted [&_svg]:size-5",
          pending && "pointer-events-none opacity-50",
        )}
      >
        <FileUp />
        {pending ? "Import en cours…" : "Importer (CSV/Excel)"}
        <input
          type="file"
          name="participantsFile"
          accept=".csv,.xlsx"
          className="hidden"
          disabled={pending}
          onChange={(e) => {
            if (e.target.files?.length) formRef.current?.requestSubmit();
          }}
        />
      </label>

      {state?.error ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      {state?.imported != null ? (
        <p className="text-sm font-medium text-primary">
          {state.imported} participant{state.imported > 1 ? "s" : ""} importé
          {state.imported > 1 ? "s" : ""}.
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Colonnes : nom, prenom, telephone, permis, mail (nom et prénom requis).
      </p>
    </form>
  );
}
