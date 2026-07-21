import { Link } from "react-router-dom";
import type { CSSProperties } from "react";

export function HomePage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 40, marginBottom: 12 }}>놀이투어</h1>
        <p style={{ fontSize: 18, color: "#555", lineHeight: 1.6, marginBottom: 32 }}>
          전국의 놀이터를 지도 위에서 한눈에 찾아보세요.
          <br />
          아파트 단지 안 놀이터부터 공원, 학교, 실내 놀이터까지 — 우리 동네 놀이터 정보를
          함께 만들어갑니다.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/map" style={buttonStyle(true)}>
            지도에서 놀이터 찾기
          </Link>
          <Link to="/report" style={buttonStyle(false)}>
            우리 동네 놀이터 제보하기
          </Link>
        </div>
      </div>

      <section style={{ marginTop: 72 }}>
        <h2>이런 정보를 제공해요</h2>
        <ul style={{ lineHeight: 1.9, color: "#333" }}>
          <li>놀이터 이름, 유형, 주소, 찾아가는 법</li>
          <li>영업시간, 휴무일, 전화번호</li>
          <li>적합 연령대</li>
          <li>사진과 소개</li>
        </ul>
        <p style={{ color: "#777" }}>
          공공데이터를 기반으로 1차 정보를 제공하고, 나머지는 이용자들의 제보로 채워갑니다.
        </p>
      </section>
    </div>
  );
}

function buttonStyle(primary: boolean): CSSProperties {
  return {
    padding: "12px 24px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
    background: primary ? "#03c75a" : "#f1f1f1",
    color: primary ? "#fff" : "#333",
  };
}
