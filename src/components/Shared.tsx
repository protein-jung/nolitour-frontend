import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/nolitour_logo.png";
import { cardStyle, colors, fonts, primaryButtonStyle, radius } from "../styles/theme";

export function LoginGateCard({ message }: { message: string }) {
  return (
    <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
      <div style={{ ...cardStyle(), maxWidth: 420, margin: "80px auto", padding: 32, textAlign: "center" }}>
        <p style={{ marginBottom: 20 }}>{message}</p>
        <Link to="/login" style={primaryButtonStyle()}>
          로그인하러 가기
        </Link>
      </div>
    </div>
  );
}

export function AuthCard({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
      <div
        style={{
          ...cardStyle(),
          maxWidth: 380,
          margin: "64px auto",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            height: 4,
            backgroundImage: `repeating-linear-gradient(90deg, ${colors.yellow} 0 16px, ${colors.green} 16px 32px)`,
          }}
        />
        <div style={{ padding: "32px 32px 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <img src={logo} alt="놀이투어" style={{ width: 72, height: 72, objectFit: "contain" }} />
          </div>
          <h1 style={{ textAlign: "center", fontSize: 26, marginBottom: 20 }}>{heading}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontFamily: fonts.ui, fontSize: 12.5, color: colors.textMuted }}>{label}</span>
      {children}
    </label>
  );
}

const AVATAR_PALETTE = [colors.green, colors.blue, colors.pink, colors.yellow, colors.brown, colors.greenDark];

function avatarColor(nickname: string): string {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) hash = (hash * 31 + nickname.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function AvatarCircle({ nickname, size = 36 }: { nickname: string; size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColor(nickname),
        color: "#fff",
        fontFamily: "'Jua', sans-serif",
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
    >
      {nickname.slice(0, 1)}
    </span>
  );
}

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
