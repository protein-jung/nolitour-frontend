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
