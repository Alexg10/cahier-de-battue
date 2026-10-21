"use client";

import { useEffect } from "react";
import { CollapsibleCard } from "@/components/collapsible-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ESPECES_DECOUPEES_PAR_DEFAUT } from "@/features/cahiers/constants";
import { formatDateLong } from "@/lib/format";
import type { BattueSnapshot } from "./types";
import { ConsignesCard } from "./consignes-card";
import { OfflineDelegation } from "./offline-delegation";
import { OfflineDistribution } from "./offline-distribution";
import { OfflineInvites } from "./offline-invites";
import { OfflinePointage } from "./offline-pointage";
import { OfflinePrelevements } from "./offline-prelevements";
import { useInvitePersons } from "./hooks";
import { seedIfEmpty, sync } from "./sync";
import { SyncBadge } from "./sync-badge";

export function BattueDayClient({ snapshot }: { snapshot: BattueSnapshot }) {
  const battueId = snapshot.battue.id;

  // Hydrate le local au premier passage, puis synchronise (best-effort).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await seedIfEmpty(snapshot);
      if (!cancelled) await sync(battueId);
    })();
    const onOnline = () => void sync(battueId);
    window.addEventListener("online", onOnline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
    };
    // On ne re-synchronise pas sur changement de snapshot (participants stables).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battueId]);

  // « Réchauffe » le cache du service worker avec le HTML complet de cette page.
  // La navigation SPA ne met en cache que le fragment RSC ; sans ça, un
  // rechargement hors-ligne de la battue tomberait sur l'écran hors-ligne.
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.onLine &&
      "serviceWorker" in navigator &&
      navigator.serviceWorker.controller
    ) {
      fetch(window.location.href, { cache: "reload" }).catch(() => {});
    }
  }, []);

  const { participants, presidentId, battue, cahier } = snapshot;
  // Inclut les invités créés sur l'appareil (hors-ligne) pas encore synchronisés.
  const invitePersons = useInvitePersons(battueId, snapshot.invitePersons);
  const chasseurs = participants.filter((p) => p.estChasseur);
  // Parrains possibles d'un invité : chasseurs + propriétaires.
  const parrains = [
    ...chasseurs.map((c) => ({
      value: `PARTICIPANT:${c.id}`,
      label: `${c.nom.toUpperCase()} ${c.prenom}`,
      nom: c.nom,
      prenom: c.prenom,
    })),
    ...snapshot.proprietaires.map((p) => ({
      value: `PROPRIETAIRE:${p.id}`,
      label: `${p.nom.toUpperCase()} ${p.prenom} (propriétaire)`,
      nom: p.nom,
      prenom: p.prenom,
    })),
  ];
  const president = participants.find((p) => p.id === presidentId);
  const responsable = participants.find((p) => p.id === battue.responsableId);
  const responsableNom = responsable
    ? `${responsable.nom.toUpperCase()} ${responsable.prenom}`
    : null;
  const estDelegation =
    Boolean(battue.responsableId) &&
    Boolean(president) &&
    battue.responsableId !== presidentId;

  const especes = Array.from(
    new Set([...battue.especesJour, ...cahier.especes]),
  );

  return (
    <div className="flex flex-col gap-5">
      <SyncBadge battueId={battueId} />

      {cahier.reglesSecurite.trim() ? (
        <ConsignesCard texte={cahier.reglesSecurite} />
      ) : null}

      {estDelegation && president && responsableNom ? (
        <Card>
          <CardHeader>
            <CardTitle>Délégation de pouvoir</CardTitle>
            <p className="text-sm text-muted-foreground">
              Le responsable n&apos;est pas le président : signature des deux
              parties.
            </p>
          </CardHeader>
          <CardContent>
            <OfflineDelegation
              battueId={battueId}
              presidentNom={`${president.nom.toUpperCase()} ${president.prenom}`}
              delegueNom={responsableNom}
              territoire={cahier.territoire}
              saison={cahier.saison}
              dateLongue={formatDateLong(battue.date)}
              lieu={battue.lieu ?? ""}
            />
          </CardContent>
        </Card>
      ) : null}

      <CollapsibleCard title="Pointage / signatures">
        {chasseurs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun chasseur dans la liste des participants.
          </p>
        ) : (
          <OfflinePointage
            battueId={battueId}
            chasseurs={participants}
            cotisationChasse={cahier.cotisationChasse}
            cotisationChiens={cahier.cotisationChiens}
          />
        )}
      </CollapsibleCard>

      <CollapsibleCard title="Invités">
        <OfflineInvites
          battueId={battueId}
          invitePersons={invitePersons}
          parrains={parrains}
        />
      </CollapsibleCard>

      <CollapsibleCard title="Tableau de chasse">
        <OfflinePrelevements
          battueId={battueId}
          especes={especes}
          chasseurs={chasseurs}
          invitePersons={invitePersons}
        />
      </CollapsibleCard>

      <CollapsibleCard
        title="Distribution du gibier"
        description={
          <p className="text-sm text-muted-foreground">
            Gigot tireur attribué d&apos;office au tireur ; ajoutez les autres
            morceaux.
          </p>
        }
      >
        <OfflineDistribution
          battueId={battueId}
          participants={participants}
          proprietaires={snapshot.proprietaires}
          invitePersons={invitePersons}
          morceaux={cahier.morceaux}
          especesDecoupees={
            // Instantané antérieur au réglage (page en cache) : valeurs par défaut.
            cahier.especesDecoupees ?? [...ESPECES_DECOUPEES_PAR_DEFAUT]
          }
        />
      </CollapsibleCard>
    </div>
  );
}
