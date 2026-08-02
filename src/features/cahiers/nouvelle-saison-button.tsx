"use client";

import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { dupliquerSaison } from "./actions";

/**
 * Duplique le cahier pour la saison suivante (mêmes participants, propriétaires,
 * bureau et réglages, sans les battues). Confirmation en deux temps, sans dialog
 * natif bloquant, à la manière de {@link ConfirmDelete}.
 */
export function NouvelleSaisonButton({
  cahierId,
  saisonCible,
  block,
}: {
  cahierId: string;
  saisonCible: string;
  block?: boolean;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button
        type="button"
        variant="secondary"
        block={block}
        onClick={() => setArmed(true)}
      >
        <CalendarPlus />
        Créer une nouvelle saison
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Crée un nouveau cahier pour la saison <strong>{saisonCible}</strong> avec
        les mêmes participants, propriétaires, bureau et réglages. Les battues ne
        sont pas reprises.
      </p>
      <form action={dupliquerSaison}>
        <input type="hidden" name="id" value={cahierId} />
        <SubmitButton block={block} saisonCible={saisonCible} />
      </form>
      <Button
        type="button"
        variant="ghost"
        block={block}
        onClick={() => setArmed(false)}
      >
        Annuler
      </Button>
    </div>
  );
}

function SubmitButton({
  block,
  saisonCible,
}: {
  block?: boolean;
  saisonCible: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" block={block} disabled={pending}>
      <CalendarPlus />
      {pending ? "Création…" : `Créer la saison ${saisonCible}`}
    </Button>
  );
}
