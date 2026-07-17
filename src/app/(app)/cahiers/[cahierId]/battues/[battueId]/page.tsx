import { Clock, MapPin, Pencil, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { getBattue } from "@/features/battues/queries";
import { requireCahier } from "@/features/cahiers/guard";
import { getBureau } from "@/features/participants/queries";
import { BattueDayClient } from "@/features/offline/battue-day";
import { battueSnapshot } from "@/features/offline/snapshot";
import { formatDateLong, formatPlage, refBattue } from "@/lib/format";

export const metadata: Metadata = { title: "Battue" };

export default async function BattueDetailPage({
  params,
}: {
  params: Promise<{ cahierId: string; battueId: string }>;
}) {
  const { cahierId, battueId } = await params;
  const { cahier } = await requireCahier(cahierId);
  const detail = await getBattue(cahierId, battueId);
  if (!detail) notFound();
  const { battue } = detail;

  const [snapshot, bureau] = await Promise.all([
    battueSnapshot(cahierId, battueId),
    getBureau(cahierId),
  ]);
  if (!snapshot) notFound();

  const president = bureau.find((b) => b.role === "PRESIDENT");
  const responsableNom = detail.responsablePrenom
    ? `${detail.responsablePrenom} ${detail.responsableNom}`
    : null;
  const plage = formatPlage(battue.heureDebut, battue.heureFin);

  return (
    <>
      <PageHeader
        title={`Battue - ${refBattue(battue.numero, cahier.saison)}`}
        subtitle={formatDateLong(battue.date)}
        backHref={`/cahiers/${cahierId}/battues`}
        action={
          <Button
            variant="ghost"
            size="icon"
            render={
              <Link
                href={`/cahiers/${cahierId}/battues/${battueId}/modifier`}
                aria-label="Modifier la battue"
              />
            }
          >
            <Pencil />
          </Button>
        }
      />
      <Container className="flex flex-col gap-5">
        <Card>
          <CardContent className="flex flex-col gap-2 pt-4">
            <p className="text-lg font-bold capitalize">
              {formatDateLong(battue.date)}
            </p>
            {battue.lieu ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                {battue.lieu}
              </p>
            ) : null}
            {plage ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4" />
                {plage}
              </p>
            ) : null}
            <p className="text-muted-foreground">
              Responsable :{" "}
              <span className="font-semibold text-foreground">
                {responsableNom ?? "à désigner"}
              </span>
              {president && battue.responsableId === president.participantId ? (
                <span> (président)</span>
              ) : null}
            </p>
            {battue.especesJour.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {battue.especesJour.map((e) => (
                  <Badge key={e} variant="default">
                    {e}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <BattueDayClient snapshot={snapshot} />

        <Button
          variant="secondary"
          block
          render={
            <Link href={`/cahiers/${cahierId}/battues/${battueId}/impression`} />
          }
        >
          <Printer />
          Version imprimable (PDF)
        </Button>
      </Container>
    </>
  );
}
