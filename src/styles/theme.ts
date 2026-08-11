import type { CSSProperties } from "react";

// nolitour_logo.png 에서 추출한 팔레트를, 놀이터 안전표지판 톤으로 한 단계 낮춰 다듬음
export const colors = {
  green: "#57A13F",
  greenDark: "#376B26",
  yellow: "#FFB627",
  blue: "#4991cc",
  pink: "#FF7A62",
  cream: "#FBF1DE",
  creamDeep: "#F3DAB3",
  brown: "#5c3d26",
  text: "#2E2A22",
  textMuted: "#87796A",
} as const;

// 역할이 분리된 타이포그래피: 브랜드 헤드라인 / UI 구조 / 본문 / 손글씨 캡션
export const fonts = {
  display: "'Jua', sans-serif",
  ui: "'Do Hyeon', sans-serif",
  body: "'Gowun Dodum', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
  hand: "'Gaegu', cursive",
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
    fontFamily: fonts.ui,
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
    fontFamily: fonts.ui,
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
  };
}
