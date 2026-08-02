import {
  ChevronRight,
  FileSpreadsheet,
  Printer,
  UserPlus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { requireCahier } from "@/features/cahiers/guard";
import { BureauEditor } from "@/features/participants/bureau-editor";
import { ImportParticipantsForm } from "@/features/participants/import-participants-form";
import { getBureau, listParticipants } from "@/features/participants/queries";

export const metadata: Metadata = { title: "Participants & bureau" };

const ROLE_LABEL: Record<string, string> = {
  PRESIDENT: "Président",
  TRESORIER: "Trésorier",
  SECRETAIRE: "Secrétaire",
};

export default async function ParticipantsPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  await requireCahier(cahierId);
  const [participants, bureau] = await Promise.all([
    listParticipants(cahierId),
    getBureau(cahierId),
  ]);

  const bureauByRole: Record<string, string> = {};
  const rolesByParticipant: Record<string, string[]> = {};
  for (const b of bureau) {
    bureauByRole[b.role] = b.participantId;
    (rolesByParticipant[b.participantId] ??= []).push(b.role);
  }

  return (
    <>
      <PageHeader
        title="Participants & bureau"
        backHref={`/cahiers/${cahierId}`}
      />
      <Container className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Bureau</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choisissez les responsables parmi les participants.
            </p>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ajoutez d&apos;abord des participants.
              </p>
            ) : (
              <BureauEditor
                cahierId={cahierId}
                participants={participants}
                current={bureauByRole}
              />
            )}
          </CardContent>
        </Card>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">
              Participants ({participants.length})
            </h2>
            {participants.length > 0 ? (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  render={
                    <Link
                      href={`/cahiers/${cahierId}/participants/impression`}
                    />
                  }
                >
                  <Printer />
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  render={
                    <a href={`/api/cahiers/${cahierId}/participants/export`} />
                  }
                >
                  <FileSpreadsheet />
                  Excel
                </Button>
              </div>
            ) : null}
          </div>

          <Button
            render={<Link href={`/cahiers/${cahierId}/participants/nouveau`} />}
            block
            className="mb-3"
          >
            <UserPlus />
            Ajouter un participant
          </Button>

          <div className="mb-3">
            <ImportParticipantsForm cahierId={cahierId} />
          </div>

          {participants.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Aucun participant pour l&apos;instant.
            </Card>
          ) : (
            <ul className="flex flex-col gap-2">
              {participants.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/cahiers/${cahierId}/participants/${p.id}`}
                    className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {p.nom.toUpperCase()} {p.prenom}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(rolesByParticipant[p.id] ?? []).map((r) => (
                          <Badge key={r} variant="primary">
                            {ROLE_LABEL[r]}
                          </Badge>
                        ))}
                        {!p.estChasseur ? (
                          <Badge variant="muted">Non chasseur</Badge>
                        ) : null}
                        {p.telephone ? (
                          <span className="text-sm text-muted-foreground">
                            {p.telephone}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </>
  );
}
