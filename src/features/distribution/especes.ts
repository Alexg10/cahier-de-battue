/**
 * Repérage compact des espèces dans le récap de distribution : une
 * abréviation de 2 lettres (unique dans le tableau) et une couleur par espèce.
 */

export type EspeceLegende = { nom: string; abrev: string; couleur: string };

/** Abréviations et couleurs fixes des espèces courantes (stables d'un récap à l'autre). */
const CONNUES: Record<string, { abrev: string; couleur: string }> = {
  sanglier: { abrev: "Sg", couleur: "#5b3a29" },
  chevreuil: { abrev: "Ch", couleur: "#c26a1b" },
  cerf: { abrev: "Ce", couleur: "#9f2a2a" },
  faisan: { abrev: "Fa", couleur: "#2f7d4f" },
  pigeon: { abrev: "Pi", couleur: "#56677a" },
  renard: { abrev: "Re", couleur: "#d9541e" },
  lievre: { abrev: "Li", couleur: "#8a6d3b" },
  perdrix: { abrev: "Pe", couleur: "#6b7b2a" },
  blaireau: { abrev: "Bl", couleur: "#3f3f46" },
  ragondin: { abrev: "Ra", couleur: "#4b5d8a" },
};

/** Couleurs de repli pour les autres espèces, dans l'ordre d'apparition. */
const PALETTE = [
  "#7c3aed",
  "#0e7490",
  "#be185d",
  "#4d7c0f",
  "#b45309",
  "#1d4ed8",
  "#9d174d",
  "#047857",
];

const normaliser = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

/**
 * Légende des espèces d'un récap (triées par nom). L'abréviation est la
 * première lettre + une lettre suivante, choisie pour rester unique.
 */
export function legendeEspeces(especes: Iterable<string>): EspeceLegende[] {
  const noms = [...new Set(especes)].sort((a, b) => a.localeCompare(b, "fr"));
  // Les abréviations des espèces connues sont réservées en premier.
  const prises = new Set(
    noms.flatMap((nom) => {
      const connue = CONNUES[normaliser(nom)];
      return connue ? [connue.abrev] : [];
    }),
  );
  let palette = 0;
  return noms.map((nom) => {
    const connue = CONNUES[normaliser(nom)];
    let abrev = connue?.abrev ?? null;
    if (!abrev) {
      const lettres = normaliser(nom).replace(/[^a-z]/g, "");
      const premiere = (lettres[0] ?? "?").toUpperCase();
      for (const l of lettres.slice(1)) {
        if (!prises.has(premiere + l)) {
          abrev = premiere + l;
          break;
        }
      }
      abrev ??= `${premiere}${prises.size + 1}`;
    }
    prises.add(abrev);
    const couleur = connue?.couleur ?? PALETTE[palette++ % PALETTE.length];
    return { nom, abrev, couleur };
  });
}

type PartLike = { morceau: string | null; espece: string | null };

/** Regroupe les parts identiques d'une case : [{ part, n }] dans l'ordre d'apparition. */
export function regrouperParts<P extends PartLike>(parts: P[] | undefined) {
  const groupes = new Map<string, { part: P; n: number }>();
  for (const p of parts ?? []) {
    const key = `${p.morceau ?? ""}|${p.espece ?? ""}`;
    const g = groupes.get(key);
    if (g) g.n += 1;
    else groupes.set(key, { part: p, n: 1 });
  }
  return [...groupes.values()];
}

/**
 * Case en texte (Excel) : « gT Sg, C Sg ×2, Fa », « — » si vide. Le morceau
 * seul pour une distribution antérieure sans espèce.
 */
export function formatPartsTexte(
  parts: PartLike[] | undefined,
  especes: EspeceLegende[],
): string {
  const abrev = new Map(especes.map((e) => [e.nom, e.abrev]));
  const groupes = regrouperParts(parts);
  if (groupes.length === 0) return "—";
  return groupes
    .map(({ part, n }) => {
      const esp = part.espece ? (abrev.get(part.espece) ?? part.espece) : null;
      const txt = [part.morceau, esp].filter(Boolean).join(" ");
      return n > 1 ? `${txt} ×${n}` : txt;
    })
    .join(", ");
}
