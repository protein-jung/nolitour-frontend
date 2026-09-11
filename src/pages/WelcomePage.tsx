import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { colors, fonts, inputStyle, primaryButtonStyle, radius, secondaryButtonStyle, shadow } from "../styles/theme";
import { IconChatBubble, IconFlame, IconPin } from "../components/Shared";
import logo from "../assets/nolitour_logo.png";

type Media = { kind: "image"; src: string; alt: string } | { kind: "report-mockup" };

type Feature = {
  icon: () => ReactElement;
  color: string;
  eyebrow: string;
  title: string;
  desc: string;
  media: Media;
  cta: { label: string; to: string };
};

const FEATURES: Feature[] = [
  {
    icon: () => <IconPin size={22} />,
    color: colors.green,
    eyebrow: "지도 검색 · 필터",
    title: "동네 놀이터, 지도에서 한눈에",
    desc:
      "현재 위치 기준으로 가까운 놀이터를 지도와 리스트로 보여줘요. 연령대, 그늘, 주차, 화장실 같은 조건으로 필터링하고, 마음에 드는 곳을 골라 상세 정보까지 바로 확인할 수 있어요.",
    media: { kind: "image", src: "/landing/map_search_filter.gif", alt: "지도에서 놀이터를 검색하고 필터를 적용하는 모습" },
    cta: { label: "지도에서 찾아보기", to: "/map" },
  },
  {
    icon: () => <IconFlame size={22} />,
    color: colors.pink,
    eyebrow: "인기 놀이터 랭킹",
    title: "다른 부모들이 많이 찾는 곳",
    desc:
      "좋아요, 저장, 조회수, 별점을 종합한 인기 점수로 놀이터 순위를 매겨요. 우리 동네뿐 아니라 전국에서 지금 가장 인기 있는 놀이터를 랭킹으로 확인해보세요.",
    media: { kind: "image", src: "/landing/ranking.gif", alt: "인기 놀이터 랭킹 리스트를 살펴보는 모습" },
    cta: { label: "인기 놀이터 보기", to: "/rankings/playgrounds" },
  },
  {
    icon: () => <IconChatBubble size={22} />,
    color: colors.blue,
    eyebrow: "놀이터 제보",
    title: "우리 동네 놀이터, 지도를 함께 채워요",
    desc:
      "공공데이터에 없는 아파트 단지 놀이터나 새로 생긴 놀이터를 직접 제보할 수 있어요. 이름, 위치, 시설 정보를 등록하면 다른 이용자들에게도 바로 공유돼요.",
    media: { kind: "report-mockup" },
    cta: { label: "놀이터 제보하기", to: "/report" },
  },
];

function BrowserFrame({ children }: { children: ReactElement }) {
  return (
    <div
      style={{
        borderRadius: radius.lg,
        overflow: "hidden",
        boxShadow: shadow,
        border: `1px solid ${colors.creamDeep}`,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 14px",
          background: colors.cream,
          borderBottom: `1px solid ${colors.creamDeep}`,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f0a3a3" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f0d59f" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#a9d3a0" }} />
      </div>
      {children}
    </div>
  );
}

const AGE_CHIPS = ["영유아", "유아", "어린이", "초등고학년"];

function ReportMockup() {
  return (
    <div style={{ padding: "22px 24px", background: "#fff" }}>
      <div style={{ fontFamily: fonts.ui, fontSize: 15, color: colors.text, marginBottom: 18 }}>놀이터 제보하기</div>

      <div style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 6 }}>장소 이름</div>
      <div style={{ ...inputStyle(), marginBottom: 16, color: colors.text }}>새싹 어린이공원</div>

      <div style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 6 }}>적합 연령대</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {AGE_CHIPS.map((label, i) => (
          <span
            key={label}
            style={{
              padding: "6px 12px",
              borderRadius: radius.pill,
              fontSize: 12.5,
              border: `1.5px solid ${i === 0 ? colors.green : colors.creamDeep}`,
              background: i === 0 ? colors.green : "#fff",
              color: i === 0 ? "#fff" : colors.textMuted,
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 6 }}>위치</div>
      <div
        style={{
          ...inputStyle(),
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: colors.greenDark,
        }}
      >
        <IconPin size={14} /> 서울 강동구 · 현재 위치로 확인됨
      </div>

      <div
        style={{
          borderRadius: radius.md,
          border: `1.5px dashed ${colors.creamDeep}`,
          background: colors.cream,
          padding: "18px",
          textAlign: "center",
          fontSize: 12.5,
          color: colors.textMuted,
          marginBottom: 18,
        }}
      >
        📷 사진 추가하기
      </div>

      <div style={{ ...primaryButtonStyle(), width: "100%", textAlign: "center", boxSizing: "border-box" }}>
        제보하기
      </div>
    </div>
  );
}

function FeatureSection({ feature, reverse }: { feature: Feature; reverse: boolean }) {
  const Icon = feature.icon;
  return (
    <div
      className="welcome-feature-row"
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: 48,
        alignItems: "center",
        direction: reverse ? "rtl" : "ltr",
      }}
    >
      <div style={{ direction: "ltr" }}>
        <BrowserFrame>
          {feature.media.kind === "image" ? (
            <img
              src={feature.media.src}
              alt={feature.media.alt}
              style={{ display: "block", width: "100%", height: "auto" }}
              loading="lazy"
            />
          ) : (
            <ReportMockup />
          )}
        </BrowserFrame>
      </div>
      <div style={{ direction: "ltr" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: feature.color,
            fontFamily: fonts.ui,
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          <Icon />
          {feature.eyebrow}
        </div>
        <h2 style={{ fontSize: 28, margin: "0 0 14px" }}>{feature.title}</h2>
        <p style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1.8, marginBottom: 24, maxWidth: 460 }}>
          {feature.desc}
        </p>
        <Link to={feature.cta.to} style={secondaryButtonStyle()}>
          {feature.cta.label}
        </Link>
      </div>
    </div>
  );
}

const STATS: { value: string; label: string }[] = [
  { value: "전국", label: "공공데이터 + 제보로 채워지는 놀이터 지도" },
  { value: "연령별", label: "영유아부터 초등 고학년까지 맞춤 필터" },
  { value: "실시간", label: "좋아요 · 저장 · 방문으로 만드는 인기 랭킹" },
];

export function WelcomePage() {
  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px 40px", textAlign: "center" }}>
        <img src={logo} alt="놀이투어" style={{ height: 56, marginBottom: 24 }} />
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
            marginBottom: 18,
          }}
        >
          전국 놀이터 지도 서비스
        </span>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.25, margin: "0 auto 18px", maxWidth: 640 }}>
          우리 아이가 놀 곳,
          <br />
          <span style={{ color: colors.greenDark }}>놀이투어</span>에서 찾아요
        </h1>
        <p
          style={{
            fontSize: 18,
            color: colors.textMuted,
            lineHeight: 1.8,
            margin: "0 auto 32px",
            maxWidth: 520,
          }}
        >
          검색부터 필터, 인기 랭킹, 제보까지 — 우리 동네 놀이터를 찾고 함께 채워가는 가장 쉬운 방법이에요.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/map" style={primaryButtonStyle()}>
            지금 놀이터 찾아보기
          </Link>
          <Link to="/register" style={secondaryButtonStyle()}>
            회원가입하고 제보하기
          </Link>
        </div>

        <div
          className="welcome-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginTop: 56,
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff",
                borderRadius: radius.lg,
                border: `1px solid ${colors.creamDeep}`,
                boxShadow: shadow,
                padding: "22px 18px",
              }}
            >
              <div style={{ fontFamily: fonts.display, fontSize: 26, color: colors.green, marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13.5, color: colors.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "72px 24px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 96 }}>
          {FEATURES.map((f, i) => (
            <FeatureSection key={f.title} feature={f} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "96px 24px 120px", textAlign: "center" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: radius.lg,
            boxShadow: shadow,
            border: `1px solid ${colors.creamDeep}`,
            padding: "56px 32px",
          }}
        >
          <h2 style={{ fontSize: 26, marginBottom: 14 }}>오늘, 우리 아이와 갈 놀이터를 찾아보세요</h2>
          <p style={{ color: colors.textMuted, marginBottom: 28, fontSize: 15.5 }}>
            공공데이터로 먼저 채우고, 나머지는 여러분의 제보로 완성해요.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/map" style={primaryButtonStyle()}>
              지도에서 찾기
            </Link>
            <Link to="/report" style={secondaryButtonStyle()}>
              놀이터 제보하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
