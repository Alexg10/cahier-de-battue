import { FileSpreadsheet, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { CotisationsTable } from "@/features/cotisations/cotisations-table";
import { saisonCotisationsMatrix } from "@/features/cotisations/queries";
import { formatEuro } from "@/lib/format";

export const metadata: Metadata = { title: "Cotisations" };

export default async function CotisationsPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);
  const data = await saisonCotisationsMatrix(cahierId);

  return (
    <>
      <PageHeader title="Cotisations" backHref={`/cahiers/${cahierId}`} />
      <Container className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            render={<Link href={`/cahiers/${cahierId}/cotisations/impression`} />}
          >
            <Printer />
            PDF
          </Button>
          <Button
            variant="secondary"
            render={<a href={`/api/cahiers/${cahierId}/cotisations/export`} />}
          >
            <FileSpreadsheet />
            Excel
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-muted-foreground">
            Chasse {formatEuro(data.montantChasse)} · Chiens{" "}
            {formatEuro(data.montantChiens)} par battue.
          </p>
          <p className="font-semibold">
            Total récolté : {formatEuro(data.totalGeneral)}
          </p>
        </div>

        <Card className="overflow-x-auto p-3">
          <CotisationsTable data={data} />
        </Card>

        <p className="text-xs text-muted-foreground">
          ✓ ou montant = a versé · X = n&apos;a pas participé.
        </p>
      </Container>
    </>
  );
}
