import type { ReactNode } from "react";
import { colors, radius } from "../styles/theme";

export function Tag({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      style={{
        background: color,
        color: "#fff",
        fontSize: 12,
        padding: "3px 10px",
        borderRadius: radius.pill,
      }}
    >
      {children}
    </span>
  );
}

export function StarDisplay({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span style={{ color: colors.yellow, letterSpacing: 1 }}>
      {"★".repeat(rounded)}
      <span style={{ color: colors.creamDeep }}>{"★".repeat(Math.max(0, 5 - rounded))}</span>
    </span>
  );
}

export function StarPicker({ rating, onChange }: { rating: number; onChange: (value: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(rating === n ? 0 : n)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 20,
            padding: 0,
            color: n <= rating ? colors.yellow : colors.creamDeep,
            lineHeight: 1,
          }}
          aria-label={`${n}점`}
        >
          ★
        </button>
      ))}
      <span style={{ fontSize: 12, color: colors.textMuted }}>
        {rating > 0 ? `${rating}점 (선택 안 함으로 취소)` : "별점 (선택)"}
      </span>
    </div>
  );
}

export function VisitStamp({ nickname, size = "md" }: { nickname: string; size?: "sm" | "md" }) {
  const dimension = size === "sm" ? 52 : 68;
  const fontSize = size === "sm" ? 10 : 12;
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: dimension,
        height: dimension,
        borderRadius: "50%",
        border: `2px solid ${colors.pink}`,
        color: colors.pink,
        transform: "rotate(-12deg)",
        fontFamily: "'Jua', sans-serif",
        lineHeight: 1.3,
        textAlign: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize, wordBreak: "keep-all", padding: "0 4px" }}>{nickname}</span>
      <span style={{ fontSize: fontSize + 1 }}>왔다감</span>
    </div>
  );
}
