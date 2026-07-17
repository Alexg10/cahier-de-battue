import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { deleteBattue } from "@/features/battues/actions";
import { BattueForm } from "@/features/battues/battue-form";
import { getBattue } from "@/features/battues/queries";
import { requireCahier } from "@/features/cahiers/guard";
import {
  getPresident,
  listParticipants,
} from "@/features/participants/queries";

export const metadata: Metadata = { title: "Modifier la battue" };

export default async function ModifierBattuePage({
  params,
}: {
  params: Promise<{ cahierId: string; battueId: string }>;
}) {
  const { cahierId, battueId } = await params;
  const { cahier } = await requireCahier(cahierId);
  const detail = await getBattue(cahierId, battueId);
  if (!detail) notFound();

  const [participants, presidentId] = await Promise.all([
    listParticipants(cahierId),
    getPresident(cahierId),
  ]);

  return (
    <>
      <PageHeader
        title="Modifier la battue"
        backHref={`/cahiers/${cahierId}/battues/${battueId}`}
      />
      <Container className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <BattueForm
              cahierId={cahierId}
              participants={participants}
              especes={cahier.especes}
              presidentId={presidentId}
              dateDefaut={detail.battue.date}
              battue={detail.battue}
            />
          </CardContent>
        </Card>
        <ConfirmDelete action={deleteBattue} block label="Supprimer cette battue">
          <input type="hidden" name="cahierId" value={cahierId} />
          <input type="hidden" name="id" value={battueId} />
        </ConfirmDelete>
      </Container>
    </>
  );
}
