const PALETTE = ["#1A7A42", "#0369a1", "#7c3aed", "#b45309", "#be185d", "#0f766e"];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length]!;
}

export function Avatar({ name, size = 34 }: { name: string | null | undefined; size?: number }) {
  const label = (name ?? "?").trim();
  const initials =
    label
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: colorFor(label || "?"),
      }}
    >
      {initials}
    </div>
  );
}
