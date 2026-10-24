// Parse "YYYY-MM-DD" as a local calendar date (no UTC shift).
export function parseLocalDate(dateStr: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!m) return new Date(dateStr);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
}

export function formatSwedishDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Weekly report covers the 7 days ending on `endDateStr`.
export function formatWeekRange(endDateStr: string): string {
  const end = parseLocalDate(endDateStr);
  const start = new Date(end);
  start.setDate(end.getDate() - 7);
  const startStr = start.toLocaleDateString("sv-SE", { day: "numeric", month: "long" });
  return `${startStr} – ${formatSwedishDate(endDateStr)}`;
}
