import { Link, useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";
import { useAuth } from "../context/AuthContext";
import { PlaygroundForm } from "../components/PlaygroundForm";
import { createPlayground, uploadPlaygroundImage } from "../api/playgrounds";
import type { PlaygroundCreate } from "../types/playground";
import { cardStyle, colors, inputStyle, primaryButtonStyle, radius, secondaryButtonStyle, shadow } from "../styles/theme";

const previewLabelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14,
  color: colors.brown,
  fontWeight: 600,
};

function ReportFormPreview() {
  return (
    <div style={{ ...cardStyle(), padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      <label style={previewLabelStyle}>
        놀이터 이름 *
        <input style={inputStyle()} placeholder="예: 행복어린이공원" readOnly tabIndex={-1} />
      </label>

      <label style={previewLabelStyle}>
        유형
        <select style={inputStyle()} defaultValue="" disabled>
          <option value="">선택 안함</option>
        </select>
      </label>

      <fieldset style={{ border: `2px solid ${colors.creamDeep}`, borderRadius: radius.md, padding: 14 }}>
        <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>적합 연령 (복수 선택 가능)</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {["영유아", "유아", "어린이", "초등학생"].map((ag) => (
            <label key={ag} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
              <input type="checkbox" disabled tabIndex={-1} />
              {ag}
            </label>
          ))}
        </div>
      </fieldset>

      <div style={previewLabelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>주소 *</span>
          <button type="button" disabled style={{ ...secondaryButtonStyle(), padding: "6px 14px", fontSize: 13, whiteSpace: "nowrap" }}>
            📍 현위치로
          </button>
        </div>
        <input
          style={{ ...inputStyle(), width: "100%", boxSizing: "border-box" }}
          placeholder="도로명 또는 지번 주소를 입력하세요"
          readOnly
          tabIndex={-1}
        />
        <p style={{ fontSize: 12, color: colors.textMuted, margin: "6px 0 0" }}>
          주소를 선택하면 아래 지도에 마커가 표시돼요. 마커를 드래그하거나 지도를 클릭해서 정확한 위치로 조정할 수 있어요
        </p>
        <div
          style={{
            height: 320,
            borderRadius: radius.md,
            border: `2px solid ${colors.creamDeep}`,
            background: colors.creamDeep,
          }}
        />
      </div>

      <label style={previewLabelStyle}>
        상세주소 (동/호수 등)
        <input style={inputStyle()} placeholder="예: 101동 놀이터 앞" readOnly tabIndex={-1} />
      </label>

      <label style={previewLabelStyle}>
        사진
        <div
          style={{
            border: `2px dashed ${colors.creamDeep}`,
            borderRadius: radius.md,
            padding: 24,
            textAlign: "center",
            color: colors.textMuted,
            fontSize: 14,
          }}
        >
          📷 사진을 추가해주세요
        </div>
      </label>

      <button type="button" disabled style={{ ...primaryButtonStyle(true), width: "100%", boxShadow: shadow }}>
        제보하기
      </button>
    </div>
  );
}

export function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={{ background: colors.cream, flex: 1, position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "40px 24px 80px",
            filter: "blur(5px)",
            opacity: 0.65,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <h1 style={{ textAlign: "center" }}>놀이터 제보하기</h1>
          <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: 28 }}>
            우리 동네 놀이터 정보를 알려주시면 다른 이용자들에게도 큰 도움이 됩니다 🙌
          </p>
          <ReportFormPreview />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{ ...cardStyle(), maxWidth: 380, padding: 32, textAlign: "center" }}>
            <p style={{ marginBottom: 20 }}>놀이터 제보는 로그인 후 이용할 수 있습니다.</p>
            <Link to="/login" style={primaryButtonStyle()}>
              로그인하러 가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(payload: PlaygroundCreate, photos: File[]) {
    const playground = await createPlayground(payload);
    for (const photo of photos) {
      await uploadPlaygroundImage(playground.id, photo);
    }
    navigate("/map");
  }

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ textAlign: "center" }}>놀이터 제보하기</h1>
        <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: 28 }}>
          우리 동네 놀이터 정보를 알려주시면 다른 이용자들에게도 큰 도움이 됩니다 🙌
        </p>

        <PlaygroundForm submitLabel="제보하기" submittingLabel="등록 중..." onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
