// total_kobo/total_spent come back from admin-api as strings (Postgres
// bigint over JSON) — never coerce through Number for money math, only for
// display formatting here.
export function fmtNaira(kobo: string | number): string {
  const value = typeof kobo === "string" ? Number(kobo) : kobo;
  return "₦" + (value / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}
