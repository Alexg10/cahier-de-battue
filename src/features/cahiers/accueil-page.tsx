import { CalendarDays, ChevronRight, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/features/auth/logout-button";
import {
  HomeCalendar,
  HomeCalendarToggle,
} from "@/features/cahiers/home-calendar";
import { listAllBattues, listCahiers } from "@/features/cahiers/queries";
import { requireUser } from "@/lib/session";

/** Accueil connecté : liste des cahiers (rendue sur « / » si une session existe). */
export async function AccueilPage() {
  const user = await requireUser();
  const [cahiers, battues] = await Promise.all([
    listCahiers(user.id),
    listAllBattues(user.id),
  ]);

  return (
    <>
      <PageHeader
        title="Mes cahiers de battue"
        action={
          <div className="flex items-center gap-1">
            <HomeCalendarToggle />
            <LogoutButton />
          </div>
        }
      />
      <Container className="flex flex-col gap-4">
        <HomeCalendar battues={battues} />

        <Button render={<Link href="/cahiers/nouveau" />} size="lg" block>
          <Plus />
          Nouveau cahier de battue
        </Button>

        {cahiers.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <p className="text-base font-semibold">
              Aucun cahier pour l&apos;instant
            </p>
            <p className="text-sm text-muted-foreground">
              Créez votre premier cahier de battue pour une saison de chasse.
            </p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {cahiers.map((c) => (
              <li key={c.id}>
                <Link href={`/cahiers/${c.id}`}>
                  <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold">{c.nom}</p>
                      {c.territoire ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {c.territoire}
                        </p>
                      ) : null}
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          Saison {c.saison}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-4" />
                          {c.participantsCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-4" />
                          {c.battuesCount}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
