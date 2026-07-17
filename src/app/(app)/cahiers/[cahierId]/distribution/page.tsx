import { FileSpreadsheet, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { DistributionTable } from "@/features/distribution/distribution-table";
import { saisonDistributionMatrix } from "@/features/distribution/queries";

export const metadata: Metadata = { title: "Distribution du gibier" };

export default async function DistributionPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);
  const data = await saisonDistributionMatrix(cahierId);

  return (
    <>
      <PageHeader
        title="Distribution du gibier"
        backHref={`/cahiers/${cahierId}`}
      />
      <Container className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            render={
              <Link href={`/cahiers/${cahierId}/distribution/impression`} />
            }
          >
            <Printer />
            PDF
          </Button>
          <Button
            variant="secondary"
            render={<a href={`/api/cahiers/${cahierId}/distribution/export`} />}
          >
            <FileSpreadsheet />
            Excel
          </Button>
        </div>

        {data.morceaux.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            Légende :{" "}
            {data.morceaux.map((m, i) => (
              <span key={m.code}>
                {i > 0 ? " · " : ""}
                <span className="font-semibold text-foreground">{m.code}</span> ={" "}
                {m.label}
              </span>
            ))}
          </p>
        ) : null}

        <Card className="overflow-x-auto p-3">
          <DistributionTable data={data} />
        </Card>

        <p className="text-xs text-muted-foreground">
          Le gigot (code g) est attribué d&apos;office au tireur de chaque animal.
        </p>
      </Container>
    </>
  );
}
