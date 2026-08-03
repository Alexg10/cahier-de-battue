import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { ParticipantForm } from "@/features/participants/participant-form";
import { listParticipantParrains } from "@/features/participants/queries";

export const metadata: Metadata = { title: "Nouveau participant" };

export default async function NouveauParticipantPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);
  const parrains = await listParticipantParrains(cahierId);

  return (
    <>
      <PageHeader
        title="Nouveau participant"
        backHref={`/cahiers/${cahierId}/participants`}
      />
      <Container>
        <Card>
          <CardContent className="pt-6">
            <ParticipantForm cahierId={cahierId} parrains={parrains} />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
