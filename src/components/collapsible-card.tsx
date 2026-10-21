"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Carte de section réductible : ouverte par défaut. Réduite, elle garde un
 * aperçu du début du contenu (fondu) ; un clic sur l'aperçu la rouvre.
 */
export function CollapsibleCard({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [reduit, setReduit] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const toggle = () => {
    const next = !reduit;
    setReduit(next);
    // En réduisant une longue liste depuis le bas, on remonte sur la section
    // pour ne pas perdre sa position dans la page.
    if (next && ref.current && ref.current.getBoundingClientRect().top < 0) {
      ref.current.scrollIntoView({ block: "start" });
    }
  };

  return (
    <div ref={ref} className="scroll-mt-16">
      <Card>
        <CardHeader>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!reduit}
            className="-my-2 -mr-2 flex items-center gap-2 py-2 text-left"
          >
            <CardTitle className="flex-1">{title}</CardTitle>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
              <ChevronDown
                className={cn(
                  "size-5 transition-transform",
                  !reduit && "rotate-180",
                )}
              />
              <span className="sr-only">
                {reduit ? "Développer la section" : "Réduire la section"}
              </span>
            </span>
          </button>
          {description}
        </CardHeader>
        <CardContent className="relative">
          <div
            inert={reduit}
            className={cn(reduit && "max-h-36 overflow-hidden")}
          >
            {children}
          </div>
          {reduit ? (
            <button
              type="button"
              onClick={() => setReduit(false)}
              className="absolute inset-0 flex items-end justify-center rounded-b-[var(--radius)] bg-linear-to-b from-card/0 via-card/70 to-card pb-3 text-sm font-semibold text-primary"
            >
              <span className="flex items-center gap-1">
                Tout afficher
                <ChevronDown className="size-4" />
              </span>
            </button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
