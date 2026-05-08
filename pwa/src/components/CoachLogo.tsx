// COACH₂ wordmark — ported from design/Fitness App.html ScreenHome header (line ~478).
// The "O" sits inside an orbit ring with a single oxygen dot to evoke the brand mark.

interface Props {
  size?: number;
  dim?: boolean;
}

export function CoachLogo({ size = 22, dim = false }: Props) {
  const sub = Math.round(size * 0.5);
  return (
    <span
      className="inline-flex items-baseline gap-0 leading-none"
      style={{
        fontFamily: "var(--font-space-grotesk), var(--font-noto-sans-tc), sans-serif",
        opacity: dim ? 0.55 : 1,
      }}
    >
      <span
        style={{
          fontSize: size,
          fontWeight: 700,
          letterSpacing: "-0.07em",
          color: "var(--foreground)",
        }}
      >
        C
      </span>
      <span
        className="relative inline-flex items-center justify-center"
        style={{ width: size * 0.82, height: size * 1.18 }}
      >
        <svg
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width={size * 1.27}
          height={size * 1.27}
          viewBox="0 0 28 28"
          fill="none"
        >
          <ellipse
            cx="14"
            cy="14"
            rx="13"
            ry="7"
            stroke="var(--primary)"
            strokeWidth="1.2"
            strokeDasharray="3 2.5"
            opacity="0.75"
            style={{ transformOrigin: "center", transform: "rotate(-20deg)" }}
          />
          <circle cx="25" cy="7" r="2.2" fill="var(--primary)" />
        </svg>
        <span
          className="relative z-10"
          style={{
            fontSize: size,
            fontWeight: 700,
            letterSpacing: "-0.07em",
            color: "var(--foreground)",
          }}
        >
          O
        </span>
      </span>
      <span
        style={{
          fontSize: size,
          fontWeight: 700,
          letterSpacing: "-0.07em",
          color: "var(--foreground)",
        }}
      >
        ACH
      </span>
      <span
        className="self-end mb-[2px]"
        style={{
          fontSize: Math.max(8, sub),
          fontWeight: 700,
          color: "var(--primary)",
          marginLeft: 2,
          lineHeight: 1,
        }}
      >
        ₂
      </span>
    </span>
  );
}
