import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  battues,
  bureauMembres,
  cahiers,
  invites,
  participants,
  pointages,
  prelevements,
  users,
} from "./schema";
import { ESPECES_PAR_DEFAUT } from "@/features/cahiers/constants";

const DEMO_EMAIL = "demo@battue.fr";
const DEMO_PASSWORD = "battue123";

async function main() {
  console.log("→ Seed : compte de démonstration…");

  // Compte de démo (idempotent).
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  const userId =
    existing?.id ??
    (
      await db
        .insert(users)
        .values({ email: DEMO_EMAIL, passwordHash, name: "Gérant démo" })
        .returning({ id: users.id })
    )[0].id;

  // Cahier de démo.
  const [cahier] = await db
    .insert(cahiers)
    .values({
      userId,
      nom: "ACCA de démonstration",
      territoire: "Bois de la Forge",
      saison: "2025/2026",
      especes: [...ESPECES_PAR_DEFAUT],
    })
    .returning({ id: cahiers.id });

  // Participants.
  const membres = [
    { nom: "Martin", prenom: "Jean", tel: "0600000001" },
    { nom: "Dubois", prenom: "Pierre", tel: "0600000002" },
    { nom: "Bernard", prenom: "Luc", tel: "0600000003" },
    { nom: "Petit", prenom: "Marie", tel: "0600000004", chasseur: false },
    { nom: "Robert", prenom: "Paul", tel: "0600000005" },
  ];
  const insertedParticipants = await db
    .insert(participants)
    .values(
      membres.map((p, i) => ({
        cahierId: cahier.id,
        nom: p.nom,
        prenom: p.prenom,
        telephone: p.tel,
        numAssurance: `ASS-2025-${100 + i}`,
        numValidation: `VAL-2025-${200 + i}`,
        estChasseur: p.chasseur ?? true,
      })),
    )
    .returning({ id: participants.id });

  // Bureau : président = Jean Martin, secrétaire = Marie Petit (non chasseuse).
  await db.insert(bureauMembres).values([
    {
      cahierId: cahier.id,
      role: "PRESIDENT",
      participantId: insertedParticipants[0].id,
    },
    {
      cahierId: cahier.id,
      role: "SECRETAIRE",
      participantId: insertedParticipants[3].id,
    },
  ]);

  // Une battue passée avec pointage, invité et prélèvement.
  const [battue] = await db
    .insert(battues)
    .values({
      cahierId: cahier.id,
      numero: 1,
      date: "2025-11-15",
      lieu: "Parcelle des Chênes",
      heureDebut: "08:00",
      heureFin: "12:30",
      responsableId: insertedParticipants[0].id,
      especesJour: ["Chevreuil", "Sanglier", "Renard"],
    })
    .returning({ id: battues.id });

  await db.insert(pointages).values([
    {
      battueId: battue.id,
      participantId: insertedParticipants[0].id,
      role: "POSTE",
      signedAt: new Date(),
    },
    {
      battueId: battue.id,
      participantId: insertedParticipants[1].id,
      role: "TRAQUEUR",
      signedAt: new Date(),
    },
  ]);

  const [invite] = await db
    .insert(invites)
    .values({
      battueId: battue.id,
      participantId: insertedParticipants[0].id,
      nom: "Durand",
      prenom: "Michel",
      numPermis: "PERMIS-9988",
      numValidation: "VAL-INV-01",
      numAssurance: "ASS-INV-01",
      role: "POSTE",
    })
    .returning({ id: invites.id });

  await db.insert(prelevements).values([
    {
      battueId: battue.id,
      espece: "Chevreuil",
      numBracelet: "BR-2025-001",
      age: "Adulte",
      sexe: "MALE",
      poids: "18.50",
      tireurParticipantId: insertedParticipants[1].id,
    },
    {
      battueId: battue.id,
      espece: "Sanglier",
      numBracelet: "BR-2025-002",
      age: "Jeune",
      sexe: "FEMELLE",
      poids: "42.00",
      tireurInviteId: invite.id,
    },
  ]);

  console.log("✓ Seed terminé.");
  console.log(`  Compte : ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Cahier : ${cahier.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
