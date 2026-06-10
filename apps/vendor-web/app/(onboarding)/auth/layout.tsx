import { AuthAnimator } from "@/components/animations/AuthAnimator";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthAnimator>
    <div className="flex min-h-screen w-full">
      {/* ── LEFT: Brand Panel ─────────────────────────────────── */}
      <div data-auth-left className="relative hidden lg:flex w-[52%] flex-shrink-0 flex-col overflow-hidden">
        <img
          // src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=85"
          src="https://img.freepik.com/free-photo/medium-shot-black-woman-running-small-business_23-2150171818.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 20%", zIndex: 0 }}
        />

        {/* Dark overlay — heavier at bottom so stats card reads cleanly */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,42,22,0.52) 0%, rgba(6,42,22,0.38) 35%, rgba(6,42,22,0.72) 70%, rgba(6,42,22,0.90) 100%)",
            zIndex: 1,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: "rgba(10,77,42,0.28)",
            zIndex: 2,
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.04, zIndex: 3 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dot-grid"
              width="26"
              height="26"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.8" cy="1.8" r="1.4" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        <svg
          className="absolute -bottom-16 -right-16"
          style={{ opacity: 0.07, zIndex: 3 }}
          width="320"
          height="320"
          viewBox="0 0 320 320"
          fill="none"
        >
          <circle cx="160" cy="160" r="155" stroke="white" strokeWidth="1.2" />
          <circle cx="160" cy="160" r="115" stroke="white" strokeWidth="0.8" />
          <circle cx="160" cy="160" r="75" stroke="white" strokeWidth="0.6" />
        </svg>

        <div
          className="relative flex flex-col h-full p-7 justify-between"
          style={{ zIndex: 10 }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 6h18"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M16 10a4 4 0 01-8 0"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-white font-bold text-[17px] tracking-tight">
              GoMarket
            </span>
          </div>

          <div>
            <p
              className="text-[9px] font-extrabold uppercase tracking-[0.22em] mb-3"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Built for Nigerian vendors
            </p>
            <h2
              className="text-[28px] font-extrabold leading-tight max-w-[260px]"
              style={{
                color: "#ffffff",
                letterSpacing: "-0.5px",
                textShadow: "0 2px 12px rgba(0,0,0,0.3)",
              }}
            >
              Sell more.
              <br />
              Stress less.
            </h2>
            <p
              className="text-[13px] mt-3 leading-relaxed max-w-[230px]"
              style={{ color: "rgba(255,255,255,0.68)" }}
            >
              Accept Naira payments, manage inventory, and grow your business —
              all from one place.
            </p>
          </div>

          {/* Stats card + social proof */}
          <div className="flex flex-col gap-3">
            {/* White floating card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.97)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.18)",
              }}
            >
              {/* Card header */}
              <div className="px-5 pt-[18px] pb-3.5">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-[7px]">
                    <div
                      className="w-2 h-2 rounded-full bg-green-500"
                      style={{ animation: "pulse 2s infinite" }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.1em]"
                      style={{ color: "#3D6B4F" }}
                    >
                      Today's Revenue
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-bold px-[9px] py-[3px] rounded-full"
                    style={{ background: "#dcfce7", color: "#15803d" }}
                  >
                    ↑ 18%
                  </span>
                </div>
                <p
                  className="text-[30px] font-extrabold leading-none mb-1"
                  style={{ letterSpacing: "-1px", color: "#1C1C1C" }}
                >
                  ₦248,500
                </p>
                <p className="text-[11px]" style={{ color: "#3D6B4F" }}>
                  vs ₦210,200 yesterday
                </p>
              </div>

              {/* Mini bar chart */}
              <div className="px-5 pb-3.5">
                <svg
                  width="100%"
                  height="32"
                  viewBox="0 0 260 32"
                  preserveAspectRatio="none"
                >
                  <rect
                    x="2"
                    y="16"
                    width="14"
                    height="16"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="22"
                    y="6"
                    width="14"
                    height="26"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="42"
                    y="12"
                    width="14"
                    height="20"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="62"
                    y="1"
                    width="14"
                    height="31"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="82"
                    y="9"
                    width="14"
                    height="23"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="102"
                    y="4"
                    width="14"
                    height="28"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="122"
                    y="14"
                    width="14"
                    height="18"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="142"
                    y="5"
                    width="14"
                    height="27"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="162"
                    y="2"
                    width="14"
                    height="30"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="182"
                    y="10"
                    width="14"
                    height="22"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="202"
                    y="3"
                    width="14"
                    height="29"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="222"
                    y="7"
                    width="14"
                    height="25"
                    rx="3"
                    fill="#dcfce7"
                  />
                  <rect
                    x="242"
                    y="0"
                    width="14"
                    height="32"
                    rx="3"
                    fill="#1A7A42"
                  />
                </svg>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* Stats row */}
              <div className="grid grid-cols-3">
                {[
                  { emoji: "📦", value: "34", label: "Orders" },
                  { emoji: "🛍️", value: "142", label: "Products" },
                  { emoji: "👤", value: "1.2k", label: "Customers" },
                ].map(({ emoji, value, label }, i) => (
                  <div
                    key={label}
                    className="flex flex-col items-center py-3"
                    style={{
                      borderRight: i < 2 ? "1px solid #f1f5f9" : undefined,
                    }}
                  >
                    <span className="text-[13px] mb-0.5">{emoji}</span>
                    <span
                      className="text-[15px] font-extrabold"
                      style={{ color: "#1C1C1C" }}
                    >
                      {value}
                    </span>
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.08em]"
                      style={{ color: "#3D6B4F" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-2.5">
              <div className="flex">
                {[
                  { initial: "A", bg: "#1A7A42" },
                  { initial: "K", bg: "#239452" },
                  { initial: "O", bg: "#0A4D2A" },
                  { initial: "E", bg: "#22c55e" },
                ].map(({ initial, bg }, i) => (
                  <div
                    key={initial}
                    className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-extrabold text-white"
                    style={{
                      background: bg,
                      border: "2px solid rgba(255,255,255,0.25)",
                      marginLeft: i > 0 ? "-8px" : undefined,
                    }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p
                className="text-[11px] font-medium"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                <span className="text-white font-bold">2,400+</span> merchants
                active today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Area ──────────────────────────────────── */}
      <div data-auth-right className="flex flex-1 flex-col items-center overflow-y-auto bg-white px-9 py-10">
        <div data-auth-card className="w-full max-w-[360px] my-auto">{children}</div>
      </div>
    </div>
    </AuthAnimator>
  );
}
