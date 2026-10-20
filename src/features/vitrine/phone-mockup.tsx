import { Tag, WifiOff } from "lucide-react";

type Ligne = {
  nom: string;
  detail: string;
  etat: "signe" | "a-signer" | "attente";
  signature?: string;
  rotation?: string;
};

const LIGNES: Ligne[] = [
  { nom: "MARTIN Paul", detail: "Posté · chasse + chiens", etat: "signe", signature: "P. Martin", rotation: "-rotate-6" },
  { nom: "ROUX Camille", detail: "Traqueur · chasse", etat: "signe", signature: "C.Roux", rotation: "-rotate-3" },
  { nom: "BERNARD Luc", detail: "Posté", etat: "a-signer" },
  { nom: "DURAND Marc", detail: "Invité de G. Petit", etat: "attente" },
];

/** Faux écran « jour de battue » affiché dans le hero (purement décoratif). */
export function PhoneMockup() {
  return (
    <div className="relative flex min-w-0 flex-[1_1_380px] justify-center py-5">
      <div
        aria-hidden="true"
        className="absolute inset-x-[6%] top-10 bottom-0 rounded-[40px] bg-[repeating-linear-gradient(-45deg,#eef4ec_0_18px,#e5eee2_18px_36px)]"
      />

      <div
        role="img"
        aria-label="Aperçu de l'écran de pointage d'une battue dans l'application"
        className="relative w-80 max-w-full rounded-[44px] bg-foreground p-3 shadow-[0_30px_60px_-20px_rgba(28,25,23,0.35)]"
      >
        <div className="flex flex-col overflow-hidden rounded-[34px] bg-background">
          <div className="flex flex-col gap-1 bg-primary px-[18px] pt-[22px] pb-4 text-primary-foreground">
            <span className="text-xs font-medium opacity-85">
              Société de chasse · 2026/2027
            </span>
            <span className="font-display text-[26px] leading-[1.05] font-bold">
              Battue n°7 · Sam. 14 déc.
            </span>
            <span className="mt-1.5 inline-flex items-center gap-1.5 self-start rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
              <WifiOff className="size-3.5" aria-hidden="true" />
              Hors-ligne · enregistré sur l&apos;appareil
            </span>
          </div>

          <div className="flex flex-col gap-2.5 p-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-bold">Pointage</span>
              <span className="text-[13px] font-medium text-muted-foreground">
                14 / 18 signés
              </span>
            </div>

            {LIGNES.map((l) => (
              <div
                key={l.nom}
                className={
                  l.etat === "a-signer"
                    ? "flex items-center gap-2.5 rounded-[14px] border-2 border-blaze bg-card px-3 py-2.5"
                    : l.etat === "attente"
                      ? "flex items-center gap-2.5 rounded-[14px] border border-border bg-card px-3 py-2.5 opacity-70"
                      : "flex items-center gap-2.5 rounded-[14px] border border-border bg-card px-3 py-2.5"
                }
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-bold">{l.nom}</span>
                  <span className="text-xs text-muted-foreground">{l.detail}</span>
                </div>
                {l.etat === "signe" ? (
                  <span className={`font-display text-xl text-primary italic ${l.rotation ?? ""}`}>
                    {l.signature}
                  </span>
                ) : l.etat === "a-signer" ? (
                  <span className="rounded-[10px] bg-primary px-3 py-2 text-[13px] font-bold text-primary-foreground">
                    Signer
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground">
                    En attente
                  </span>
                )}
              </div>
            ))}

            <div className="mt-1 flex gap-2">
              <span className="flex-1 rounded-[10px] bg-accent py-2.5 text-center text-[13px] font-bold text-accent-foreground">
                Prélèvements · 3
              </span>
              <span className="flex-1 rounded-[10px] bg-accent py-2.5 text-center text-[13px] font-bold text-accent-foreground">
                Partage
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte flottante : un prélèvement */}
      <div
        aria-hidden="true"
        className="absolute bottom-[34px] left-0 flex items-center gap-3 rounded-[14px] border border-border bg-card px-3.5 py-3 shadow-[0_14px_30px_-12px_rgba(28,25,23,0.25)]"
      >
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-blaze">
          <Tag className="size-5 text-foreground" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold">Sanglier · ♂ · 62 kg</span>
          <span className="text-xs text-muted-foreground">
            Bracelet SAN-0412 · tiré par P. Martin
          </span>
        </div>
      </div>
    </div>
  );
}
