import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyPlaygrounds } from "../api/playgrounds";
import type { Playground } from "../types/playground";
import { PLAYGROUND_TYPE_LABEL } from "../types/playground";
import { cardStyle, colors, primaryButtonStyle, radius } from "../styles/theme";

export function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playgrounds, setPlaygrounds] = useState<Playground[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/api\/v1\/?$/, "");

  useEffect(() => {
    if (!user) return;
    fetchMyPlaygrounds()
      .then(setPlaygrounds)
      .catch(() => setError("제보 목록을 불러오지 못했습니다."));
  }, [user]);

  if (!user) {
    return (
      <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "80px auto", padding: 32, textAlign: "center" }}>
          <p>마이페이지는 로그인 후 이용할 수 있습니다.</p>
          <button type="button" onClick={() => navigate("/login")} style={primaryButtonStyle()}>
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1>마이페이지</h1>
        <p style={{ color: colors.textMuted, marginBottom: 24 }}>
          {user.nickname}님, 안녕하세요! ({user.name} / {user.phone})
        </p>

        <h2>내가 제보한 놀이터</h2>
        {error && <p style={{ color: colors.pink }}>{error}</p>}
        {!error && playgrounds === null && <p>불러오는 중...</p>}
        {playgrounds && playgrounds.length === 0 && (
          <p style={{ color: colors.textMuted }}>아직 제보한 놀이터가 없어요.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {playgrounds?.map((p) => (
            <div key={p.id} style={{ ...cardStyle(), padding: 18, display: "flex", gap: 14 }}>
              {p.images[0] && (
                <img
                  src={`${apiBase}${p.images[0].image_url}`}
                  alt={p.name}
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: radius.sm, flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 17 }}>{p.name}</h3>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: radius.pill,
                      background: p.is_verified ? colors.green : colors.creamDeep,
                      color: p.is_verified ? "#fff" : colors.brown,
                    }}
                  >
                    {p.is_verified ? "검수완료" : "검수대기"}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: colors.textMuted, margin: "4px 0" }}>{p.address}</p>
                {p.type && (
                  <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>
                    {PLAYGROUND_TYPE_LABEL[p.type]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
