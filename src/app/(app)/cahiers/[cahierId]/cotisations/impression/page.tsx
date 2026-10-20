import { Crosshair, Dog, FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireCahier } from "@/features/cahiers/guard";
import { CotisationsTable } from "@/features/cotisations/cotisations-table";
import { saisonCotisationsMatrix } from "@/features/cotisations/queries";
import { PrintButton } from "@/features/export/print-button";
import { formatEuro } from "@/lib/format";

export const metadata: Metadata = { title: "Cotisations — impression" };

export default async function CotisationsImpressionPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  const { cahier } = await requireCahier(cahierId);
  const data = await saisonCotisationsMatrix(cahierId);

  return (
    <div className="mx-auto w-full max-w-5xl bg-white px-5 py-6 text-black print:max-w-none print:px-0">
      {/* Tableau large : impression en paysage. */}
      <style>{"@media print { @page { size: landscape; } }"}</style>

      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/cahiers/${cahierId}/cotisations`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Retour
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            render={<a href={`/api/cahiers/${cahierId}/cotisations/export`} />}
          >
            <FileSpreadsheet />
            Excel
          </Button>
          <PrintButton />
        </div>
      </div>

      <header className="mb-4 border-b-2 border-black pb-3">
        <h1 className="text-xl font-bold">Cotisations</h1>
        <p className="text-sm">
          {cahier.nom}
          {cahier.territoire ? ` — ${cahier.territoire}` : ""} · Saison{" "}
          {cahier.saison} · Total récolté {formatEuro(data.totalGeneral)}
        </p>
        <p className="flex flex-wrap items-center gap-x-1 text-xs text-gray-600">
          Chasse {formatEuro(data.montantChasse)} · Chiens{" "}
          {formatEuro(data.montantChiens)} par battue · ✓ ou montant = a versé
          · <Crosshair className="size-3" /> chasse ·{" "}
          <Dog className="size-3" /> chiens · X = non versé.
        </p>
      </header>

      <div className="overflow-x-auto">
        <CotisationsTable data={data} print />
      </div>
    </div>
  );
}
