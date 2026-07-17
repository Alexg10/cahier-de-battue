import { CalendarDays, Coins, MapPin, Plus, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Calendar } from "@/features/battues/calendar";
import { listBattues } from "@/features/battues/queries";
import { requireCahier } from "@/features/cahiers/guard";
import { formatDateShort, formatEuro, refBattue } from "@/lib/format";

export const metadata: Metadata = { title: "Battues" };

export default async function BattuesPage({
  params,
}: {
  params: Promise<{ cahierId: string }>;
}) {
  const { cahierId } = await params;
  const { cahier } = await requireCahier(cahierId);
  const battues = await listBattues(cahierId);

  const cotChasse = Number(cahier.cotisationChasse);
  const cotChiens = Number(cahier.cotisationChiens);
  const hasCotisations = cotChasse > 0 || cotChiens > 0;

  const today = new Date().toISOString().slice(0, 10);
  const aVenir = battues.filter((b) => b.date >= today);
  const passees = battues.filter((b) => b.date < today).reverse();

  return (
    <>
      <PageHeader title="Battues" backHref={`/cahiers/${cahierId}`} />
      <Container className="flex flex-col gap-5">
        <Calendar cahierId={cahierId} battues={battues} />

        <Button
          render={<Link href={`/cahiers/${cahierId}/battues/nouvelle`} />}
          block
        >
          <Plus />
          Nouvelle battue
        </Button>

        <BattueGroup
          title="À venir"
          cahierId={cahierId}
          items={aVenir}
          empty="Aucune battue programmée."
          saison={cahier.saison}
          cotChasse={cotChasse}
          cotChiens={cotChiens}
          hasCotisations={hasCotisations}
        />
        <BattueGroup
          title="Passées"
          cahierId={cahierId}
          items={passees}
          empty="Aucune battue passée."
          saison={cahier.saison}
          cotChasse={cotChasse}
          cotChiens={cotChiens}
          hasCotisations={hasCotisations}
        />
      </Container>
    </>
  );
}

function BattueGroup({
  title,
  cahierId,
  items,
  empty,
  saison,
  cotChasse,
  cotChiens,
  hasCotisations,
}: {
  title: string;
  cahierId: string;
  items: Awaited<ReturnType<typeof listBattues>>;
  empty: string;
  saison: string;
  cotChasse: number;
  cotChiens: number;
  hasCotisations: boolean;
}) {
  return (
    <div>
      <h2 className="mb-2 text-base font-bold">{title}</h2>
      {items.length === 0 ? (
        <Card className="p-5 text-center text-sm text-muted-foreground">
          {empty}
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((b) => (
            <li key={b.id}>
              <Link href={`/cahiers/${cahierId}/battues/${b.id}`}>
                <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent">
                  <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <CalendarDays className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      <span className="capitalize">
                        {formatDateShort(b.date)}
                      </span>{" "}
                      -{" "}
                      <span className="text-muted-foreground">
                        n° {refBattue(b.numero, saison)}
                      </span>
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {b.lieu ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-4" />
                          {b.lieu}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <Target className="size-4" />
                        {b.prelevementsCount} prélevé
                        {b.prelevementsCount > 1 ? "s" : ""}
                      </span>
                      {hasCotisations ? (
                        <span className="inline-flex items-center gap-1">
                          <Coins className="size-4" />
                          {formatEuro(
                            b.cotisChasseCount * cotChasse +
                              b.cotisChiensCount * cotChiens,
                          )}{" "}
                          récoltés
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {b.cloturee ? <Badge variant="muted">Clôturée</Badge> : null}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
