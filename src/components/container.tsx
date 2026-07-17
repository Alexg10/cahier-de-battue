import * as React from "react";
import { cn } from "@/lib/utils";

/** Conteneur de contenu centré, largeur mobile confortable. */
export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main
      className={cn("mx-auto w-full max-w-2xl px-4 py-4", className)}
      {...props}
    />
  );
}
