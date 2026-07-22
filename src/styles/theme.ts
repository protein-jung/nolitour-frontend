import type { CSSProperties } from "react";

// nolitour_logo.png 에서 추출한 팔레트
export const colors = {
  green: "#8bc558",
  greenDark: "#6ea83f",
  yellow: "#fec81b",
  blue: "#4991cc",
  pink: "#fc8c8f",
  cream: "#fff8ea",
  creamDeep: "#feebd3",
  brown: "#5c3d26",
  text: "#3d2c1e",
  textMuted: "#8a7a6c",
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export const shadow = "0 4px 14px rgba(92, 61, 38, 0.12)";

export function primaryButtonStyle(disabled = false): CSSProperties {
  return {
    padding: "12px 28px",
    borderRadius: radius.pill,
    border: "none",
    fontWeight: 700,
    fontFamily: "'Jua', sans-serif",
    fontSize: 16,
    cursor: disabled ? "default" : "pointer",
    background: disabled ? "#c9dfb4" : colors.green,
    color: "#fff",
    boxShadow: shadow,
    textDecoration: "none",
    display: "inline-block",
  };
}

export function secondaryButtonStyle(): CSSProperties {
  return {
    padding: "12px 28px",
    borderRadius: radius.pill,
    border: `2px solid ${colors.green}`,
    fontWeight: 700,
    fontFamily: "'Jua', sans-serif",
    fontSize: 16,
    cursor: "pointer",
    background: "#fff",
    color: colors.greenDark,
    textDecoration: "none",
    display: "inline-block",
  };
}

export function cardStyle(): CSSProperties {
  return {
    background: "#fff",
    borderRadius: radius.lg,
    boxShadow: shadow,
    border: `1px solid ${colors.creamDeep}`,
  };
}

export function inputStyle(): CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: radius.md,
    border: `2px solid ${colors.creamDeep}`,
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
  };
}
