import { WifiOff } from "lucide-react";

export const metadata = { title: "Hors ligne" };

export default function HorsLignePage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <WifiOff className="size-8" />
      </span>
      <h1 className="text-xl font-bold">Vous êtes hors ligne</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Cette page n'a pas encore été chargée. Les pages déjà consultées restent
        accessibles sans réseau. Reconnectez-vous pour charger de nouvelles
        données.
      </p>
    </div>
  );
}
