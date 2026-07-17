"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Suppression en deux temps (pas de dialog natif bloquant).
 * `action` est une server action ; `children` contient les champs cachés.
 */
export function ConfirmDelete({
  action,
  children,
  label = "Supprimer",
  confirmLabel = "Confirmer la suppression",
  block,
}: {
  action: (formData: FormData) => void | Promise<void>;
  children?: React.ReactNode;
  label?: string;
  confirmLabel?: string;
  block?: boolean;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button
        type="button"
        variant="destructive"
        block={block}
        onClick={() => setArmed(true)}
      >
        <Trash2 />
        {label}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={action}>
        {children}
        <Button type="submit" variant="destructive" block={block}>
          <Trash2 />
          {confirmLabel}
        </Button>
      </form>
      <Button
        type="button"
        variant="secondary"
        block={block}
        onClick={() => setArmed(false)}
      >
        Annuler
      </Button>
    </div>
  );
}
