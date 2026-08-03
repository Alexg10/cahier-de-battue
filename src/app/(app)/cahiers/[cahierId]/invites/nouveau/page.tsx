import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { InviteForm } from "@/features/invites/invite-form";
import { listParrainOptions } from "@/features/invites/queries";

export const metadata: Metadata = { title: "Nouvel invité" };

export default async function NouvelInvitePage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);
  const parrains = await listParrainOptions(cahierId);

  return (
    <>
      <PageHeader
        title="Nouvel invité"
        backHref={`/cahiers/${cahierId}/invites`}
      />
      <Container>
        <Card>
          <CardContent className="pt-6">
            <InviteForm cahierId={cahierId} parrains={parrains} />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
