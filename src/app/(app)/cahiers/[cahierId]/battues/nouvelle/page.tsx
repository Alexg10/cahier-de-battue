import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { BattueForm } from "@/features/battues/battue-form";
import { requireCahier } from "@/features/cahiers/guard";
import {
  getPresident,
  listParticipants,
} from "@/features/participants/queries";

export const metadata: Metadata = { title: "Nouvelle battue" };

export default async function NouvelleBattuePage({
  params,
  searchParams,
}: {
  params: Promise<{ cahierId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { cahierId } = await params;
  const { date } = await searchParams;
  const { cahier } = await requireCahier(cahierId);
  const [participants, presidentId] = await Promise.all([
    listParticipants(cahierId),
    getPresident(cahierId),
  ]);

  const dateDefaut =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Nouvelle battue"
        backHref={`/cahiers/${cahierId}/battues`}
      />
      <Container>
        <Card>
          <CardContent className="pt-6">
            <BattueForm
              cahierId={cahierId}
              participants={participants}
              especes={cahier.especes}
              presidentId={presidentId}
              dateDefaut={dateDefaut}
            />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
