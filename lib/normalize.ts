export function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[|.,;:!?()“”‘’'"—–-]/g, " ").toLowerCase().replace(/\s+/g, " ").trim();
}
export function excerptAround(text: string, query: string, radius = 90): string {
  const index = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (index < 0) return text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text;
  const start = Math.max(0, index - radius); const end = Math.min(text.length, index + query.length + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}
