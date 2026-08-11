import type { CSSProperties, ReactElement, SVGProps } from "react";
import { Link } from "react-router-dom";
import { colors, fonts, primaryButtonStyle, radius, secondaryButtonStyle, shadow } from "../styles/theme";
import { IconPin } from "../components/Shared";

function iconProps(): SVGProps<SVGSVGElement> {
  return {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
}

function IconRoute() {
  return (
    <svg {...iconProps()}>
      <circle cx="5" cy="6" r="2" />
      <path d="M5 8c0 6.5 12 1.5 12 8" strokeDasharray="2 3.4" />
      <path d="M17 13v7" />
      <path d="M17 13l3.4 1.8-3.4 1.8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.2 2" />
    </svg>
  );
}

function IconAge() {
  return (
    <svg {...iconProps()}>
      <path d="M4 3v18M4 8h2.4M4 14h2.4" />
      <circle cx="16" cy="7.6" r="2.6" />
      <path d="M13 20.5v-5.4a3 3 0 0 1 3-3 3 3 0 0 1 3 3v5.4" />
    </svg>
  );
}

const FEATURES: { icon: () => ReactElement; color: string; title: string; desc: string }[] = [
  { icon: () => <IconPin size={26} />, color: colors.green, title: "이름·유형·주소", desc: "정확한 위치와 유형을 한 번에 확인해요" },
  { icon: IconRoute, color: colors.blue, title: "찾아가는 법", desc: "아파트 단지 안에 있으면 동선까지 안내해요" },
  { icon: IconClock, color: colors.yellow, title: "영업시간·휴무일", desc: "헛걸음하지 않게 미리 알려드려요" },
  { icon: IconAge, color: colors.pink, title: "적합 연령", desc: "우리 아이 나이에 맞는 곳을 골라요" },
];

type Pin = { x: number; y: number; fill: string; label?: string };

const PINS: Pin[] = [
  { x: 76, y: 78, fill: colors.green },
  { x: 168, y: 52, fill: colors.green },
  { x: 252, y: 104, fill: colors.blue },
  { x: 118, y: 156, fill: colors.green },
  { x: 214, y: 188, fill: colors.pink, label: "새싹어린이공원" },
];

function MapPin({ x, y, fill, delay }: Pin & { delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="home-map-pin" style={{ "--pin-delay": `${delay}s` } as CSSProperties}>
        <ellipse cx="0" cy="17" rx="7" ry="2.4" fill="rgba(46,42,34,0.16)" />
        <path
          d="M0 -16C6.6 -16 12 -10.8 12 -4.3C12 4.9 0 17 0 17C0 17 -12 4.9 -12 -4.3C-12 -10.8 -6.6 -16 0 -16Z"
          fill={fill}
          stroke="#fff"
          strokeWidth={1.5}
        />
        <circle cx="0" cy="-4" r="4.5" fill="#fff" />
      </g>
    </g>
  );
}

function HeroMapPanel() {
  const labeled = PINS.find((p) => p.label);
  return (
    <div className="home-hero-map">
      <div
        style={{
          borderRadius: radius.lg,
          overflow: "hidden",
          boxShadow: shadow,
          border: `1px solid ${colors.creamDeep}`,
          background: `linear-gradient(160deg, ${colors.cream} 0%, #f2e6c8 100%)`,
        }}
      >
        <svg viewBox="0 0 340 260" style={{ display: "block", width: "100%", height: "auto" }} aria-hidden>
          <path d="M0 150 C 70 120, 110 190, 190 150 S 300 90, 340 130" stroke="#fff" strokeOpacity="0.6" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M40 20 C 90 70, 60 140, 130 210" stroke="#fff" strokeOpacity="0.45" strokeWidth="8" fill="none" strokeLinecap="round" />
          <ellipse cx="60" cy="60" rx="46" ry="34" fill={colors.green} opacity="0.16" />
          <ellipse cx="270" cy="200" rx="60" ry="40" fill={colors.green} opacity="0.16" />
          {PINS.map((p, i) => (
            <MapPin key={p.label ?? `${p.x}-${p.y}`} {...p} delay={0.15 + i * 0.2} />
          ))}
          {labeled && (
            <g transform={`translate(${labeled.x} ${labeled.y - 32})`}>
              <g className="home-map-label">
                <rect x={-52} y={-14} width={104} height={26} rx={13} fill="#fff" stroke={colors.creamDeep} />
                <text x={0} y={4} textAnchor="middle" fontSize="11" fontFamily={fonts.ui} fill={colors.text}>
                  {labeled.label}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
      <p
        style={{
          fontFamily: fonts.hand,
          fontSize: 18,
          color: colors.greenDark,
          textAlign: "center",
          margin: "12px 0 0",
        }}
      >
        ✏️ 제보로 계속 채워지는 중이에요
      </p>
    </div>
  );
}

export function HomePage() {
  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 24px 96px" }}>
        <div className="home-hero">
          <div>
            <span
              style={{
                display: "inline-block",
                fontFamily: fonts.ui,
                fontSize: 13,
                color: colors.greenDark,
                background: "#fff",
                border: `1.5px solid ${colors.green}`,
                borderRadius: radius.pill,
                padding: "5px 14px",
                marginBottom: 16,
              }}
            >
              전국 놀이터 지도
            </span>
            <h1 style={{ fontSize: "clamp(32px, 4.4vw, 46px)", lineHeight: 1.25, margin: "0 0 16px" }}>
              우리 동네 놀이터,
              <br />
              지도에 다 있어요
            </h1>
            <p style={{ fontSize: 17, color: colors.textMuted, lineHeight: 1.7, marginBottom: 28, maxWidth: 440 }}>
              아파트 단지 안 놀이터부터 공원, 학교 놀이터까지 — 이용자들의 제보로 전국 놀이터
              지도를 함께 채워가고 있어요.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/map" style={primaryButtonStyle()}>
                지도에서 찾기
              </Link>
              <Link to="/report" style={secondaryButtonStyle()}>
                우리 동네 놀이터 제보하기
              </Link>
            </div>
          </div>

          <HeroMapPanel />
        </div>

        <section style={{ marginTop: 96 }}>
          <div
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: radius.lg,
              boxShadow: shadow,
              border: `1px solid ${colors.creamDeep}`,
              padding: "44px 32px 36px",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: colors.creamDeep,
              }}
            />
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: colors.creamDeep,
              }}
            />
            <h2 style={{ textAlign: "center", marginBottom: 32 }}>놀이터 안내판</h2>
            <div className="home-signboard-grid">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ color: f.color, flexShrink: 0, marginTop: 2 }}>
                      <Icon />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, margin: "0 0 4px" }}>{f.title}</h3>
                      <p style={{ fontSize: 13.5, color: colors.textMuted, margin: 0 }}>{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p style={{ textAlign: "center", color: colors.textMuted, marginTop: 24 }}>
            공공데이터로 먼저 채우고, 나머지는 여러분의 제보로 완성해요.
          </p>
        </section>
      </div>
    </div>
  );
}
