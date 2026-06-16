import { Store } from "lucide-react";

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafc" }}>
      <div
        className="flex items-center gap-2.5 px-6 shrink-0"
        style={{
          height: "56px",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: "#1A7A42" }}
        >
          <Store className="w-4 h-4 text-white" />
        </div>
        <span
          className="font-extrabold text-[17px] tracking-tight"
          style={{ color: "#1C1C1C" }}
        >
          GoMarket
        </span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
