export type AuthoringCsvRow = Record<string, string>;

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function parseAuthoringCsv(text: string): AuthoringCsvRow[] {
  const rows: string[][] = [[]];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]!;
    const next = text[index + 1];
    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      rows.at(-1)!.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      rows.at(-1)!.push(field.trim());
      field = "";
      if (rows.at(-1)!.some(Boolean)) rows.push([]);
    } else {
      field += character;
    }
  }
  rows.at(-1)!.push(field.trim());

  const [rawHeaders = [], ...dataRows] = rows.filter((row) => row.some(Boolean));
  const headers = rawHeaders.map(normalizeHeader);
  return dataRows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}
