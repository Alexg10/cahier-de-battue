import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { ProprietaireForm } from "@/features/proprietaires/proprietaire-form";

export const metadata: Metadata = { title: "Nouveau propriétaire" };

export default async function NouveauProprietairePage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);

  return (
    <>
      <PageHeader
        title="Nouveau propriétaire"
        backHref={`/cahiers/${cahierId}/proprietaires`}
      />
      <Container>
        <Card>
          <CardContent className="pt-6">
            <ProprietaireForm cahierId={cahierId} />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
