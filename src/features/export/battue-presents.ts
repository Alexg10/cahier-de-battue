import type { BattueInvite } from "@/features/invites/queries";
import { formatTelephone } from "@/lib/format";

/** Personne présente à une battue (participant pointé ou invité). */
export type Present = {
  key: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  numPermis: string | null;
  numValidation: string | null;
  nomAssurance: string | null;
  numAssurance: string | null;
  role: "POSTE" | "TRAQUEUR" | "ACCOMPAGNANT";
  /** Cotisations : null pour un invité (non concerné). */
  cotisationChasse: boolean | null;
  cotisationChiens: boolean | null;
  signature: string | null;
  /** Invité : nom du parrain (« Prénom Nom »), "" si inconnu ; null sinon. */
  invitePar: string | null;
};

/** Ordre dans le tableau des participants : postés puis accompagnants. */
const ROLE_ORDER: Record<string, number> = { POSTE: 0, ACCOMPAGNANT: 1 };

/** Membres d'abord, invités en fin de tableau. */
const invitesEnDernier = (a: Present, b: Present) =>
  Number(a.invitePar !== null) - Number(b.invitePar !== null);

const parNom = (a: Present, b: Present) =>
  `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr", {
    sensitivity: "base",
  });

/**
 * Fusionne pointages et invités d'une battue, puis sépare les traqueurs (en
 * fin de document) des autres participants. Dans chaque tableau, les invités
 * (repérés par `invitePar`) sont placés à la fin.
 */
export function splitPresents(
  pointages: {
    participantId: string;
    nom: string;
    prenom: string;
    telephone: string | null;
    numPermis: string | null;
    numValidation: string | null;
    numAssurance: string | null;
    nomAssurance: string | null;
    role: Present["role"];
    cotisationChasse: boolean;
    cotisationChiens: boolean;
    signature: string | null;
  }[],
  invites: BattueInvite[],
) {
  const presents: Present[] = [
    ...pointages.map((p) => ({
      key: `p:${p.participantId}`,
      nom: p.nom,
      prenom: p.prenom,
      telephone: formatTelephone(p.telephone),
      numPermis: p.numPermis,
      numValidation: p.numValidation,
      nomAssurance: p.nomAssurance,
      numAssurance: p.numAssurance,
      role: p.role,
      cotisationChasse: p.cotisationChasse,
      cotisationChiens: p.cotisationChiens,
      signature: p.signature,
      invitePar: null,
    })),
    ...invites.map(({ invite, parrainPrenom, parrainNom }) => ({
      key: `i:${invite.id}`,
      nom: invite.nom,
      prenom: invite.prenom,
      telephone: null,
      numPermis: invite.numPermis,
      numValidation: invite.numValidation,
      nomAssurance: null,
      numAssurance: invite.numAssurance,
      role: invite.role,
      cotisationChasse: null,
      cotisationChiens: null,
      signature: invite.signature,
      invitePar: parrainPrenom ? `${parrainPrenom} ${parrainNom}` : "",
    })),
  ];

  const participants = presents
    .filter((p) => p.role !== "TRAQUEUR")
    .sort(
      (a, b) =>
        invitesEnDernier(a, b) ||
        (ROLE_ORDER[a.role] ?? 0) - (ROLE_ORDER[b.role] ?? 0) ||
        parNom(a, b),
    );
  const traqueurs = presents
    .filter((p) => p.role === "TRAQUEUR")
    .sort((a, b) => invitesEnDernier(a, b) || parNom(a, b));
  return { participants, traqueurs };
}
