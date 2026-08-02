"use client";

import { ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MAX_PLAN_SIZE,
  PLAN_ACCEPT,
  PLAN_MIME_TYPES,
  estImage,
  formatTaille,
} from "./constants";
import type { PlanMeta } from "./queries";

export function PlansManager({
  cahierId,
  plans,
}: {
  cahierId: string;
  plans: PlanMeta[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [armedId, setArmedId] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    const erreurs: string[] = [];
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (
          !PLAN_MIME_TYPES.includes(
            file.type as (typeof PLAN_MIME_TYPES)[number],
          )
        ) {
          erreurs.push(`${file.name} : format non supporté (JPG ou PDF).`);
          continue;
        }
        if (file.size > MAX_PLAN_SIZE) {
          erreurs.push(
            `${file.name} : trop volumineux (max ${formatTaille(MAX_PLAN_SIZE)}).`,
          );
          continue;
        }
        const body = new FormData();
        body.append("file", file);
        const res = await fetch(`/api/cahiers/${cahierId}/plans`, {
          method: "POST",
          body,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          erreurs.push(`${file.name} : ${data?.error ?? "échec de l'envoi."}`);
        }
      }
      setError(erreurs.length ? erreurs.join(" ") : null);
      router.refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function supprimer(id: string) {
    setArmedId(null);
    const res = await fetch(`/api/cahiers/${cahierId}/plans/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
    else setError("La suppression a échoué.");
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        className={cn(
          "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover [&_svg]:size-5",
          uploading && "pointer-events-none opacity-50",
        )}
      >
        <Upload />
        {uploading ? "Envoi en cours…" : "Ajouter un plan (JPG ou PDF)"}
        <input
          ref={inputRef}
          type="file"
          accept={PLAN_ACCEPT}
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
          }}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        Plusieurs fichiers possibles. Taille maximale : {formatTaille(MAX_PLAN_SIZE)}{" "}
        par fichier.
      </p>

      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}

      {plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun plan pour le moment. Ajoutez une carte ou un plan du territoire.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {plans.map((plan) => {
            const url = `/api/cahiers/${cahierId}/plans/${plan.id}`;
            return (
              <li key={plan.id}>
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <FileText className="size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{plan.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {estImage(plan.mimeType) ? "Image" : "PDF"} ·{" "}
                        {formatTaille(plan.taille)}
                      </p>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                      aria-label="Ouvrir en plein écran"
                    >
                      <ExternalLink className="size-5" />
                    </a>
                    {armedId === plan.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => supprimer(plan.id)}
                        >
                          Confirmer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setArmedId(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label="Supprimer le plan"
                        onClick={() => setArmedId(plan.id)}
                        className="inline-flex size-9 items-center justify-center rounded-full text-destructive hover:bg-muted"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {estImage(plan.mimeType) ? (
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={plan.nom}
                          loading="lazy"
                          className="max-h-[70vh] w-full rounded-[var(--radius)] border border-border object-contain"
                        />
                      </a>
                    ) : (
                      <object
                        data={url}
                        type="application/pdf"
                        className="h-[70vh] w-full rounded-[var(--radius)] border border-border"
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                        >
                          <ExternalLink className="size-4" />
                          Ouvrir le PDF
                        </a>
                      </object>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
