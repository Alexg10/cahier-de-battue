"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { getDB } from "./db";

export function useBattueMeta(battueId: string) {
  return useLiveQuery(() => getDB().meta.get(battueId), [battueId]);
}

export function usePointages(battueId: string) {
  return useLiveQuery(
    async () => {
      const rows = await getDB()
        .pointages.where("battueId")
        .equals(battueId)
        .toArray();
      return rows.filter((r) => !r.deletedAt);
    },
    [battueId],
    [],
  );
}

export function useInviteParticipations(battueId: string) {
  return useLiveQuery(
    async () => {
      const rows = await getDB()
        .inviteParticipations.where("battueId")
        .equals(battueId)
        .toArray();
      return rows.filter((r) => !r.deletedAt);
    },
    [battueId],
    [],
  );
}

export function usePrelevements(battueId: string) {
  return useLiveQuery(
    async () => {
      const rows = await getDB()
        .prelevements.where("battueId")
        .equals(battueId)
        .toArray();
      return rows.filter((r) => !r.deletedAt);
    },
    [battueId],
    [],
  );
}

export function useDelegation(battueId: string) {
  return useLiveQuery(() => getDB().delegation.get(battueId), [battueId]);
}

export function useDistributions(battueId: string) {
  return useLiveQuery(
    async () => {
      const rows = await getDB()
        .distributions.where("battueId")
        .equals(battueId)
        .toArray();
      return rows.filter((r) => !r.deletedAt);
    },
    [battueId],
    [],
  );
}

/** Fiches participant locales d'une battue (réactives), triées par nom. */
export function useParticipants(battueId: string) {
  return useLiveQuery(
    async () => {
      const rows = await getDB()
        .participants.where("battueId")
        .equals(battueId)
        .toArray();
      return rows.sort((a, b) =>
        `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr", {
          sensitivity: "base",
        }),
      );
    },
    [battueId],
    undefined,
  );
}

/** Nombre de modifications non synchronisées pour la battue. */
export function useDirtyCount(battueId: string) {
  return useLiveQuery(
    async () => {
      const db = getDB();
      const [pts, invs, prels, parts, dists, deleg] = await Promise.all([
        db.pointages.where("battueId").equals(battueId).toArray(),
        db.inviteParticipations.where("battueId").equals(battueId).toArray(),
        db.prelevements.where("battueId").equals(battueId).toArray(),
        db.participants.where("battueId").equals(battueId).toArray(),
        db.distributions.where("battueId").equals(battueId).toArray(),
        db.delegation.get(battueId),
      ]);
      let n = 0;
      n += pts.filter((r) => r.dirty === 1).length;
      n += invs.filter((r) => r.dirty === 1).length;
      n += prels.filter((r) => r.dirty === 1).length;
      n += parts.filter((r) => r.dirty === 1).length;
      n += dists.filter((r) => r.dirty === 1).length;
      if (deleg?.dirty === 1) n += 1;
      return n;
    },
    [battueId],
    0,
  );
}

/** État de connexion réseau (réactif). */
export function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
