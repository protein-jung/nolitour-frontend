import { Link } from "react-router-dom";
import logo from "../assets/nolitour_logo.png";
import { colors, primaryButtonStyle, secondaryButtonStyle, cardStyle, radius } from "../styles/theme";

const FEATURES: { icon: string; color: string; title: string; desc: string }[] = [
  { icon: "🏡", color: colors.green, title: "이름·유형·주소", desc: "놀이터 이름, 유형, 정확한 주소" },
  { icon: "🧭", color: colors.blue, title: "찾아가는 법", desc: "아파트 단지 내인 경우 안내까지" },
  { icon: "🕒", color: colors.yellow, title: "영업시간·휴무일", desc: "헛걸음하지 않도록 미리 확인" },
  { icon: "🧒", color: colors.pink, title: "적합 연령", desc: "우리 아이 연령에 맞는 놀이터 찾기" },
];

export function HomePage() {
  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ textAlign: "center" }}>
          <img
            src={logo}
            alt="놀이투어"
            style={{ width: 160, height: 160, objectFit: "contain", marginBottom: 8 }}
          />
          <h1>놀이투어</h1>
          <p style={{ fontSize: 17, color: colors.textMuted, lineHeight: 1.7, marginBottom: 28 }}>
            전국의 놀이터를 지도 위에서 한눈에 찾아보세요.
            <br />
            아파트 단지 안 놀이터부터 공원, 학교, 실내 놀이터까지 — 우리 동네 놀이터 정보를
            함께 만들어갑니다.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/map" style={primaryButtonStyle()}>
              지도에서 놀이터 찾기
            </Link>
            <Link to="/report" style={secondaryButtonStyle()}>
              우리 동네 놀이터 제보하기
            </Link>
          </div>
        </div>

        <section style={{ marginTop: 72 }}>
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>이런 정보를 제공해요</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((f) => (
              <div key={f.title} style={{ ...cardStyle(), padding: 20, textAlign: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radius.pill,
                    background: f.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    fontSize: 22,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, margin: "0 0 6px" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: colors.textMuted, marginTop: 28 }}>
            공공데이터를 기반으로 1차 정보를 제공하고, 나머지는 이용자들의 제보로 채워갑니다.
          </p>
        </section>
      </div>
    </div>
  );
}
