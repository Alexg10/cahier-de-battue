import "server-only";
import ExcelJS from "exceljs";

export type ImportedParticipant = {
  nom: string;
  prenom: string;
  telephone: string | null;
  numPermis: string | null;
  email: string | null;
};

export type ImportResult = {
  participants: ImportedParticipant[];
  error?: string;
};

/** Normalise un en-tête : minuscules, sans accents ni ponctuation/espaces. */
const norm = (s: string) =>
  s.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g, "");

// Alias acceptés pour chaque champ (comparés après normalisation).
const ALIASES: Record<keyof Omit<ImportedParticipant, never>, string[]> = {
  nom: ["nom"],
  prenom: ["prenom"],
  telephone: [
    "telephone",
    "tel",
    "numtel",
    "numtelephone",
    "numerodetelephone",
    "numerotelephone",
    "portable",
    "mobile",
    "gsm",
  ],
  numPermis: [
    "permis",
    "numpermis",
    "numerodepermis",
    "numeropermis",
    "permisdechasse",
    "permisdechasser",
    "npermis",
  ],
  email: ["mail", "email", "adressemail", "adresseemail", "courriel", "emel"],
};

const clean = (v: string) => {
  const s = v.trim();
  return s.length ? s : null;
};

/** Détecte le séparateur d'un CSV (`;` fréquent en export Excel FR, sinon `,`). */
function detectDelimiter(headerLine: string) {
  const semi = (headerLine.match(/;/g) ?? []).length;
  const comma = (headerLine.match(/,/g) ?? []).length;
  return semi >= comma ? ";" : ",";
}

/** Parseur CSV minimal gérant les guillemets et le séparateur détecté. */
function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, ""); // BOM
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delim = detectDelimiter(firstLine);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delim) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Lit un .xlsx (première feuille) en tableau de lignes de chaînes. */
async function parseXlsx(buffer: ArrayBuffer): Promise<string[][]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) return [];
  const rows: string[][] = [];
  ws.eachRow((row) => {
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      cells.push(cell.text != null ? String(cell.text) : "");
    });
    rows.push(cells);
  });
  return rows;
}

/**
 * Parse un fichier CSV ou Excel (.xlsx) et renvoie les participants importables.
 * Colonnes attendues (souples, insensibles à la casse/accents) :
 * nom, prenom, telephone, permis, mail. Nom et prénom sont obligatoires.
 */
export async function parseParticipantsFile(file: File): Promise<ImportResult> {
  if (!file || file.size === 0) return { participants: [] };

  const name = file.name.toLowerCase();
  let grid: string[][];
  try {
    if (name.endsWith(".csv")) {
      grid = parseCsv(await file.text());
    } else if (name.endsWith(".xlsx")) {
      grid = await parseXlsx(await file.arrayBuffer());
    } else if (name.endsWith(".xls")) {
      return {
        participants: [],
        error:
          "Le format .xls n'est pas pris en charge. Enregistrez le fichier en .xlsx ou .csv.",
      };
    } else {
      return {
        participants: [],
        error: "Format non reconnu. Utilisez un fichier .csv ou .xlsx.",
      };
    }
  } catch {
    return { participants: [], error: "Impossible de lire le fichier." };
  }

  const header = grid.find((r) => r.some((c) => c.trim() !== ""));
  if (!header) return { participants: [] };
  const headerIndex = grid.indexOf(header);

  // Associe chaque champ à l'indice de colonne trouvé.
  const normalized = header.map((h) => norm(h));
  const col: Partial<Record<keyof ImportedParticipant, number>> = {};
  for (const [field, aliases] of Object.entries(ALIASES) as [
    keyof ImportedParticipant,
    string[],
  ][]) {
    const idx = normalized.findIndex((h) => aliases.includes(h));
    if (idx >= 0) col[field] = idx;
  }

  if (col.nom == null || col.prenom == null) {
    return {
      participants: [],
      error:
        "Colonnes « nom » et « prenom » introuvables. En-têtes attendus : nom, prenom, telephone, permis, mail.",
    };
  }

  const at = (row: string[], idx?: number) =>
    idx == null ? null : clean(row[idx] ?? "");

  const participants: ImportedParticipant[] = [];
  for (let i = headerIndex + 1; i < grid.length; i++) {
    const row = grid[i];
    const nom = at(row, col.nom);
    const prenom = at(row, col.prenom);
    if (!nom || !prenom) continue; // lignes vides / incomplètes ignorées
    participants.push({
      nom,
      prenom,
      telephone: at(row, col.telephone),
      numPermis: at(row, col.numPermis),
      email: at(row, col.email),
    });
  }

  return { participants };
}
