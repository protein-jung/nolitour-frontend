import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTopPlaygrounds } from "../api/rankings";
import type { PlaygroundRankingItem } from "../types/ranking";
import { cardStyle, colors, radius } from "../styles/theme";
import { IconFlame } from "../components/Shared";

const MEDALS = ["🥇", "🥈", "🥉"];

export function PlaygroundRankingPage() {
  const [rankings, setRankings] = useState<PlaygroundRankingItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopPlaygrounds(50)
      .then(setRankings)
      .catch(() => setError("랭킹을 불러오지 못했습니다."));
  }, []);

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            color: colors.pink,
          }}
        >
          <IconFlame size={28} />
          <span style={{ color: colors.brown }}>인기 놀이터</span>
        </h1>
        <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: 28 }}>
          좋아요 · 저장 · 조회수 · 별점을 종합한 인기 점수 순위예요
        </p>

        {error && <p style={{ color: colors.pink, textAlign: "center" }}>{error}</p>}
        {!error && rankings === null && (
          <p style={{ textAlign: "center", color: colors.textMuted }}>불러오는 중...</p>
        )}
        {rankings?.length === 0 && (
          <p style={{ textAlign: "center", color: colors.textMuted }}>아직 인기 놀이터가 없어요.</p>
        )}

        <div style={{ ...cardStyle(), overflow: "hidden" }}>
          {rankings?.map((r, i) => (
            <Link
              key={r.playground_id}
              to={`/map?playground=${r.playground_id}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "14px 20px",
                borderBottom: i < rankings.length - 1 ? `1px solid ${colors.creamDeep}` : "none",
                background: r.rank <= 3 ? colors.cream : "transparent",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: "'Jua', sans-serif",
                    fontSize: r.rank <= 3 ? 20 : 15,
                    color: colors.brown,
                    minWidth: 28,
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {MEDALS[r.rank - 1] ?? r.rank}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 15,
                      color: colors.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.name}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: colors.textMuted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.address}
                  </span>
                </span>
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "#fff",
                  background: colors.pink,
                  padding: "4px 12px",
                  borderRadius: radius.pill,
                  flexShrink: 0,
                }}
              >
                {r.score}점
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
