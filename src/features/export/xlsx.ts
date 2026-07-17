import "server-only";
import ExcelJS from "exceljs";
import type { CotisationsMatrix } from "@/features/cotisations/queries";
import { formatDateLong, formatHeure, refBattue } from "@/lib/format";

const SEXE_LABEL: Record<string, string> = {
  MALE: "Mâle",
  FEMELLE: "Femelle",
  INDETERMINE: "Indéterminé",
};
const ROLE_LABEL: Record<string, string> = {
  POSTE: "Posté",
  TRAQUEUR: "Traqueur",
};

type CahierInfo = { nom: string; territoire: string; saison: string };

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true };
  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEF4EC" },
    };
  });
}

type ParticipantExport = {
  prenom: string;
  nom: string;
  telephone: string | null;
  numPermis: string | null;
  numValidation: string | null;
  numAssurance: string | null;
  nomAssurance: string | null;
  estChasseur: boolean;
};

/** Colonnes de la feuille "Participants" (partagées saison / export dédié). */
function fillParticipantsSheet(
  sheet: ExcelJS.Worksheet,
  participants: ParticipantExport[],
) {
  sheet.columns = [
    { header: "Prénom", key: "prenom", width: 18 },
    { header: "Nom", key: "nom", width: 18 },
    { header: "Téléphone", key: "tel", width: 16 },
    { header: "N° permis", key: "permis", width: 18 },
    { header: "N° validation", key: "val", width: 18 },
    { header: "Assurance", key: "assNom", width: 20 },
    { header: "N° assurance", key: "ass", width: 18 },
    { header: "Chasseur", key: "chasseur", width: 10 },
  ];
  styleHeader(sheet.getRow(1));
  for (const p of participants) {
    sheet.addRow({
      prenom: p.prenom,
      nom: p.nom,
      tel: p.telephone ?? "",
      permis: p.numPermis ?? "",
      val: p.numValidation ?? "",
      assNom: p.nomAssurance ?? "",
      ass: p.numAssurance ?? "",
      chasseur: p.estChasseur ? "Oui" : "Non",
    });
  }
}

const VALIDATION_LABEL: Record<string, string> = {
  DEPARTEMENTALE: "Départementale",
  BI_DEPARTEMENTALE: "Bi-départementale",
  NATIONALE: "Nationale",
};

/** "2025-11-15" -> "15/11/2025" (vide si null). */
const frDate = (s: string | null) =>
  s ? s.split("-").reverse().join("/") : "";

type ParticipantFull = ParticipantExport & {
  email: string | null;
  adresse: string | null;
  dateNaissance: string | null;
  lieuNaissance: string | null;
  permisDelivreLe: string | null;
  permisDelivreA: string | null;
  typeValidation: string | null;
  timbreGrandGibier: string | null;
  adresseAssurance: string | null;
};

const TIMBRE_LABEL: Record<string, string> = {
  NATIONAL: "National",
  DEPARTEMENTAL: "Départemental",
};

/**
 * Classeur dédié à la liste des participants avec TOUTES leurs infos
 * (fiche de renseignements). Ces champs n'apparaissent que dans cet export.
 */
export async function buildParticipantsWorkbook(
  cahier: CahierInfo,
  participants: ParticipantFull[],
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cahier de battue";
  const sheet = wb.addWorksheet("Participants");
  sheet.columns = [
    { header: "Nom", key: "nom", width: 18 },
    { header: "Prénom", key: "prenom", width: 16 },
    { header: "Date naissance", key: "dateNaiss", width: 14 },
    { header: "Lieu naissance", key: "lieuNaiss", width: 18 },
    { header: "Adresse", key: "adresse", width: 30 },
    { header: "Téléphone", key: "tel", width: 16 },
    { header: "E-mail", key: "email", width: 24 },
    { header: "N° permis", key: "permis", width: 16 },
    { header: "Délivré le", key: "delivreLe", width: 14 },
    { header: "Délivré à", key: "delivreA", width: 16 },
    { header: "N° validation", key: "val", width: 16 },
    { header: "Type validation", key: "typeVal", width: 18 },
    { header: "Timbre grand gibier", key: "timbre", width: 18 },
    { header: "Assurance", key: "assNom", width: 20 },
    { header: "Adresse assurance", key: "assAdr", width: 30 },
    { header: "N° assurance", key: "assNum", width: 18 },
    { header: "Chasseur", key: "chasseur", width: 10 },
  ];
  styleHeader(sheet.getRow(1));
  for (const p of participants) {
    sheet.addRow({
      nom: p.nom,
      prenom: p.prenom,
      dateNaiss: frDate(p.dateNaissance),
      lieuNaiss: p.lieuNaissance ?? "",
      adresse: p.adresse ?? "",
      tel: p.telephone ?? "",
      email: p.email ?? "",
      permis: p.numPermis ?? "",
      delivreLe: frDate(p.permisDelivreLe),
      delivreA: p.permisDelivreA ?? "",
      val: p.numValidation ?? "",
      typeVal: p.typeValidation ? VALIDATION_LABEL[p.typeValidation] : "",
      timbre: p.timbreGrandGibier ? TIMBRE_LABEL[p.timbreGrandGibier] : "",
      assNom: p.nomAssurance ?? "",
      assAdr: p.adresseAssurance ?? "",
      assNum: p.numAssurance ?? "",
      chasseur: p.estChasseur ? "Oui" : "Non",
    });
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** Classeur de la liste des propriétaires fonciers. */
export async function buildProprietairesWorkbook(
  cahier: CahierInfo,
  proprietaires: { nom: string; prenom: string; telephone: string | null }[],
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cahier de battue";
  const sheet = wb.addWorksheet("Propriétaires");
  sheet.columns = [
    { header: "Nom", key: "nom", width: 20 },
    { header: "Prénom", key: "prenom", width: 18 },
    { header: "Téléphone", key: "tel", width: 18 },
  ];
  styleHeader(sheet.getRow(1));
  for (const p of proprietaires) {
    sheet.addRow({ nom: p.nom, prenom: p.prenom, tel: p.telephone ?? "" });
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** Classeur de la matrice des cotisations (participants × battues). */
export async function buildCotisationsWorkbook(data: CotisationsMatrix) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cahier de battue";
  const sheet = wb.addWorksheet("Cotisations");

  sheet.columns = [
    { header: "Participant", key: "participant", width: 24 },
    ...data.battues.map((b) => ({
      header: `n° ${refBattue(b.numero, data.saison)}`,
      key: `b_${b.id}`,
      width: 12,
    })),
    { header: "Total (€)", key: "total", width: 12 },
  ];
  styleHeader(sheet.getRow(1));

  for (const l of data.lignes) {
    const row: Record<string, string | number> = {
      participant: `${l.nom.toUpperCase()} ${l.prenom}`,
      total: l.total,
    };
    for (const b of data.battues) {
      const cell = l.cells[b.id];
      // Montant si versé (nombre), sinon "X".
      row[`b_${b.id}`] = cell.participe ? cell.montant : "X";
    }
    sheet.addRow(row);
  }

  const totalRow: Record<string, string | number> = {
    participant: "Total récolté",
    total: data.totalGeneral,
  };
  for (const b of data.battues) {
    totalRow[`b_${b.id}`] = data.totalParBattue[b.id] ?? 0;
  }
  const added = sheet.addRow(totalRow);
  added.font = { bold: true };

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** Classeur récapitulatif de toute la saison. */
export async function buildSaisonWorkbook(
  cahier: CahierInfo,
  participants: {
    prenom: string;
    nom: string;
    telephone: string | null;
    numPermis: string | null;
    numValidation: string | null;
    numAssurance: string | null;
    nomAssurance: string | null;
    estChasseur: boolean;
  }[],
  battues: {
    numero: number;
    date: string;
    lieu: string | null;
    heureDebut: string | null;
    heureFin: string | null;
    especesJour: string[];
    responsablePrenom: string | null;
    responsableNom: string | null;
    cotisationTotal: number;
  }[],
  prelevements: {
    date: string;
    espece: string;
    numBracelet: string | null;
    age: string | null;
    sexe: string | null;
    poids: string | null;
    tireur: string;
  }[],
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cahier de battue";

  fillParticipantsSheet(wb.addWorksheet("Participants"), participants);

  const sBat = wb.addWorksheet("Battues");
  sBat.columns = [
    { header: "N°", key: "num", width: 10 },
    { header: "Date", key: "date", width: 28 },
    { header: "Lieu", key: "lieu", width: 22 },
    { header: "Début", key: "debut", width: 10 },
    { header: "Fin", key: "fin", width: 10 },
    { header: "Responsable", key: "resp", width: 22 },
    { header: "Espèces", key: "especes", width: 30 },
    { header: "Cotisations (€)", key: "cotis", width: 14 },
  ];
  styleHeader(sBat.getRow(1));
  let totalSaison = 0;
  for (const b of battues) {
    totalSaison += b.cotisationTotal;
    sBat.addRow({
      num: refBattue(b.numero, cahier.saison),
      date: formatDateLong(b.date),
      lieu: b.lieu ?? "",
      debut: formatHeure(b.heureDebut) ?? "",
      fin: formatHeure(b.heureFin) ?? "",
      resp: b.responsablePrenom
        ? `${b.responsablePrenom} ${b.responsableNom}`
        : "",
      especes: b.especesJour.join(", "),
      cotis: b.cotisationTotal,
    });
  }
  const totalBatRow = sBat.addRow({ resp: "Total saison", cotis: totalSaison });
  totalBatRow.font = { bold: true };

  const sPrel = wb.addWorksheet("Prélèvements");
  sPrel.columns = [
    { header: "Date", key: "date", width: 28 },
    { header: "Espèce", key: "espece", width: 16 },
    { header: "N° bracelet", key: "bracelet", width: 16 },
    { header: "Âge", key: "age", width: 12 },
    { header: "Sexe", key: "sexe", width: 14 },
    { header: "Poids (kg)", key: "poids", width: 12 },
    { header: "Tireur", key: "tireur", width: 24 },
  ];
  styleHeader(sPrel.getRow(1));
  for (const p of prelevements) {
    sPrel.addRow({
      date: formatDateLong(p.date),
      espece: p.espece,
      bracelet: p.numBracelet ?? "",
      age: p.age ?? "",
      sexe: p.sexe ? SEXE_LABEL[p.sexe] : "",
      poids: p.poids ?? "",
      tireur: p.tireur,
    });
  }

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** Classeur d'une journée de battue. */
export async function buildBattueWorkbook(
  cahier: CahierInfo,
  battue: {
    numero: number;
    date: string;
    lieu: string | null;
    heureDebut: string | null;
    heureFin: string | null;
    especesJour: string[];
    responsable: string | null;
  },
  pointages: {
    prenom: string;
    nom: string;
    telephone: string | null;
    numPermis: string | null;
    numValidation: string | null;
    numAssurance: string | null;
    nomAssurance: string | null;
    role: string;
    cotisationChasse: boolean;
    cotisationChiens: boolean;
  }[],
  invites: {
    prenom: string;
    nom: string;
    numPermis: string | null;
    numValidation: string | null;
    numAssurance: string | null;
    role: string;
    parrain: string;
  }[],
  prelevements: {
    espece: string;
    numBracelet: string | null;
    age: string | null;
    sexe: string | null;
    poids: string | null;
    tireur: string;
  }[],
  cotisations: { chasse: number; chiens: number },
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cahier de battue";

  const info = wb.addWorksheet("Battue");
  info.columns = [
    { header: "", key: "k", width: 20 },
    { header: "", key: "v", width: 40 },
  ];
  info.addRows([
    { k: "Société", v: cahier.nom },
    { k: "Territoire", v: cahier.territoire },
    { k: "Saison", v: cahier.saison },
    { k: "N° battue", v: refBattue(battue.numero, cahier.saison) },
    { k: "Date", v: formatDateLong(battue.date) },
    { k: "Lieu", v: battue.lieu ?? "" },
    { k: "Début", v: formatHeure(battue.heureDebut) ?? "" },
    { k: "Fin", v: formatHeure(battue.heureFin) ?? "" },
    { k: "Responsable", v: battue.responsable ?? "" },
    { k: "Espèces du jour", v: battue.especesJour.join(", ") },
  ]);
  info.getColumn("k").font = { bold: true };

  const sPoint = wb.addWorksheet("Pointage");
  sPoint.columns = [
    { header: "Prénom", key: "prenom", width: 18 },
    { header: "Nom", key: "nom", width: 18 },
    { header: "Téléphone", key: "tel", width: 16 },
    { header: "N° permis", key: "permis", width: 16 },
    { header: "N° validation", key: "val", width: 16 },
    { header: "Assurance", key: "assNom", width: 20 },
    { header: "N° assurance", key: "ass", width: 16 },
    { header: "Rôle", key: "role", width: 12 },
    { header: "Cotis. chasse", key: "cotChasse", width: 14 },
    { header: "Cotis. chiens", key: "cotChiens", width: 14 },
    { header: "Total (€)", key: "cotTotal", width: 12 },
  ];
  styleHeader(sPoint.getRow(1));
  let totalRecolte = 0;
  for (const p of pointages) {
    const montant =
      (p.cotisationChasse ? cotisations.chasse : 0) +
      (p.cotisationChiens ? cotisations.chiens : 0);
    totalRecolte += montant;
    sPoint.addRow({
      prenom: p.prenom,
      nom: p.nom,
      tel: p.telephone ?? "",
      permis: p.numPermis ?? "",
      val: p.numValidation ?? "",
      assNom: p.nomAssurance ?? "",
      ass: p.numAssurance ?? "",
      role: ROLE_LABEL[p.role] ?? p.role,
      cotChasse: p.cotisationChasse ? "Oui" : "Non",
      cotChiens: p.cotisationChiens ? "Oui" : "Non",
      cotTotal: montant,
    });
  }
  const totalRow = sPoint.addRow({
    role: "Total récolté",
    cotTotal: totalRecolte,
  });
  totalRow.font = { bold: true };

  const sInv = wb.addWorksheet("Invités");
  sInv.columns = [
    { header: "Prénom", key: "prenom", width: 18 },
    { header: "Nom", key: "nom", width: 18 },
    { header: "N° permis", key: "permis", width: 16 },
    { header: "N° validation", key: "val", width: 16 },
    { header: "N° assurance", key: "ass", width: 16 },
    { header: "Poste", key: "role", width: 12 },
    { header: "Invité par", key: "parrain", width: 22 },
  ];
  styleHeader(sInv.getRow(1));
  for (const i of invites) {
    sInv.addRow({
      prenom: i.prenom,
      nom: i.nom,
      permis: i.numPermis ?? "",
      val: i.numValidation ?? "",
      ass: i.numAssurance ?? "",
      role: ROLE_LABEL[i.role] ?? i.role,
      parrain: i.parrain,
    });
  }

  const sPrel = wb.addWorksheet("Prélèvements");
  sPrel.columns = [
    { header: "Espèce", key: "espece", width: 16 },
    { header: "N° bracelet", key: "bracelet", width: 16 },
    { header: "Âge", key: "age", width: 12 },
    { header: "Sexe", key: "sexe", width: 14 },
    { header: "Poids (kg)", key: "poids", width: 12 },
    { header: "Tireur", key: "tireur", width: 24 },
  ];
  styleHeader(sPrel.getRow(1));
  for (const p of prelevements) {
    sPrel.addRow({
      espece: p.espece,
      bracelet: p.numBracelet ?? "",
      age: p.age ?? "",
      sexe: p.sexe ? SEXE_LABEL[p.sexe] : "",
      poids: p.poids ?? "",
      tireur: p.tireur,
    });
  }

  return Buffer.from(await wb.xlsx.writeBuffer());
}
