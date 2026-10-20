import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

/** Barre de titre collante, mobile-first, avec bouton retour optionnel. */
export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string;
  action?: React.ReactNode;
  /** Classes du conteneur interne (ex. pour élargir au-delà de `max-w-2xl`). */
  className?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div
        className={cn(
          "mx-auto flex max-w-2xl items-center gap-2 px-4 py-3",
          className,
        )}
      >
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Retour"
            className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted"
          >
            <ChevronLeft className="size-6" />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
