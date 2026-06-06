export function StorefrontIllustration() {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-hidden="true"
    >
      {/* Background base */}
      <rect width="320" height="240" fill="transparent" />

      {/* Ground shadow */}
      <ellipse cx="160" cy="215" rx="110" ry="10" fill="rgba(26,122,66,0.08)" />

      {/* Store building body */}
      <rect
        x="60"
        y="80"
        width="200"
        height="128"
        rx="6"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="1.5"
      />

      {/* Roof / awning */}
      <rect x="48" y="64" width="224" height="26" rx="4" fill="#1A7A42" />
      {/* Awning scallop pattern */}
      {[58, 82, 106, 130, 154, 178, 202, 226, 250].map((x, i) => (
        <path
          key={i}
          d={`M${x} 90 Q${x + 12} 100 ${x + 24} 90`}
          stroke="white"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
        />
      ))}

      {/* Store sign text area */}
      <rect
        x="90"
        y="70"
        width="140"
        height="14"
        rx="3"
        fill="rgba(255,255,255,0.2)"
      />
      <rect
        x="110"
        y="74"
        width="60"
        height="6"
        rx="2"
        fill="white"
        opacity="0.7"
      />
      <rect
        x="176"
        y="74"
        width="36"
        height="6"
        rx="2"
        fill="white"
        opacity="0.4"
      />

      {/* Door */}
      <rect
        x="135"
        y="148"
        width="50"
        height="60"
        rx="4"
        fill="#F0FAF3"
        stroke="#e2e8f0"
        strokeWidth="1.2"
      />
      <circle cx="179" cy="178" r="2.5" fill="#1A7A42" />
      {/* Door panels */}
      <rect
        x="140"
        y="154"
        width="18"
        height="22"
        rx="2"
        fill="white"
        opacity="0.8"
      />
      <rect
        x="162"
        y="154"
        width="18"
        height="22"
        rx="2"
        fill="white"
        opacity="0.8"
      />

      {/* Left window */}
      <rect
        x="72"
        y="106"
        width="52"
        height="42"
        rx="3"
        fill="#F0FAF3"
        stroke="#e2e8f0"
        strokeWidth="1.2"
      />
      <line
        x1="98"
        y1="106"
        x2="98"
        y2="148"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <line
        x1="72"
        y1="127"
        x2="124"
        y2="127"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      {/* Product display left */}
      <rect
        x="78"
        y="112"
        width="14"
        height="14"
        rx="2"
        fill="#1A7A42"
        opacity="0.15"
      />
      <rect
        x="96"
        y="130"
        width="22"
        height="12"
        rx="2"
        fill="#1A7A42"
        opacity="0.1"
      />

      {/* Right window */}
      <rect
        x="196"
        y="106"
        width="52"
        height="42"
        rx="3"
        fill="#F0FAF3"
        stroke="#e2e8f0"
        strokeWidth="1.2"
      />
      <line
        x1="222"
        y1="106"
        x2="222"
        y2="148"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <line
        x1="196"
        y1="127"
        x2="248"
        y2="127"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      {/* Product display right */}
      <circle cx="212" cy="120" r="6" fill="#1A7A42" opacity="0.12" />
      <rect
        x="222"
        y="112"
        width="18"
        height="10"
        rx="2"
        fill="#1A7A42"
        opacity="0.1"
      />

      {/* Steps */}
      <rect
        x="115"
        y="205"
        width="90"
        height="8"
        rx="2"
        fill="#F0FAF3"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <rect
        x="125"
        y="200"
        width="70"
        height="8"
        rx="2"
        fill="#F0FAF3"
        stroke="#e2e8f0"
        strokeWidth="1"
      />

      {/* Potted plant left */}
      <rect
        x="50"
        y="188"
        width="18"
        height="14"
        rx="2"
        fill="#1A7A42"
        opacity="0.25"
      />
      <ellipse cx="59" cy="188" rx="9" ry="7" fill="#1A7A42" opacity="0.18" />
      <path
        d="M59 182 Q52 174 47 168"
        stroke="#1A7A42"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M59 182 Q66 172 70 166"
        stroke="#1A7A42"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M59 178 Q59 170 59 162"
        stroke="#1A7A42"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Potted plant right */}
      <rect
        x="252"
        y="188"
        width="18"
        height="14"
        rx="2"
        fill="#1A7A42"
        opacity="0.25"
      />
      <ellipse cx="261" cy="188" rx="9" ry="7" fill="#1A7A42" opacity="0.18" />
      <path
        d="M261 182 Q254 174 249 168"
        stroke="#1A7A42"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M261 182 Q268 172 272 166"
        stroke="#1A7A42"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M261 178 Q261 170 261 162"
        stroke="#1A7A42"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Floating stat bubbles */}
      {/* Revenue */}
      <rect
        x="218"
        y="28"
        width="90"
        height="36"
        rx="8"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="1.2"
      />
      <circle cx="230" cy="44" r="6" fill="rgba(26,122,66,0.12)" />
      <rect
        x="242"
        y="36"
        width="40"
        height="6"
        rx="2"
        fill="#1A7A42"
        opacity="0.3"
      />
      <rect x="242" y="46" width="58" height="5" rx="2" fill="#e2e8f0" />

      {/* Orders */}
      <rect
        x="12"
        y="44"
        width="76"
        height="32"
        rx="8"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="1.2"
      />
      <rect x="22" y="52" width="30" height="5" rx="2" fill="#e2e8f0" />
      <rect
        x="22"
        y="61"
        width="50"
        height="5"
        rx="2"
        fill="#1A7A42"
        opacity="0.25"
      />

      {/* Connector lines */}
      <line
        x1="88"
        y1="60"
        x2="100"
        y2="72"
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      <line
        x1="262"
        y1="64"
        x2="248"
        y2="74"
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
    </svg>
  );
}
