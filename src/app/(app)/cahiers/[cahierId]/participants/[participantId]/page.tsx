import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { deleteParticipant } from "@/features/participants/actions";
import { ParticipantForm } from "@/features/participants/participant-form";
import { getParticipant } from "@/features/participants/queries";

export const metadata: Metadata = { title: "Modifier un participant" };

export default async function EditParticipantPage({
  params,
}: {
  params: Promise<{ cahierId: string; participantId: string }>;
}) {
  const { cahierId, participantId } = await params;
  await requireCahier(cahierId);
  const participant = await getParticipant(cahierId, participantId);
  if (!participant) notFound();

  return (
    <>
      <PageHeader
        title={`${participant.prenom} ${participant.nom}`}
        backHref={`/cahiers/${cahierId}/participants`}
      />
      <Container className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <ParticipantForm cahierId={cahierId} participant={participant} />
          </CardContent>
        </Card>

        <ConfirmDelete action={deleteParticipant} block label="Supprimer ce participant">
          <input type="hidden" name="cahierId" value={cahierId} />
          <input type="hidden" name="id" value={participant.id} />
        </ConfirmDelete>
      </Container>
    </>
  );
}
