import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ReporterRankingItem } from "../types/ranking";
import { cardStyle, colors, radius } from "../styles/theme";

const MEDALS = ["🥇", "🥈", "🥉"];

interface RankingPageProps {
  icon: string;
  title: string;
  description: string;
  emptyText: string;
  unit: string;
  fetchRankings: (limit: number) => Promise<ReporterRankingItem[]>;
}

export function RankingPage({ icon, title, description, emptyText, unit, fetchRankings }: RankingPageProps) {
  const [rankings, setRankings] = useState<ReporterRankingItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings(50)
      .then(setRankings)
      .catch(() => setError("랭킹을 불러오지 못했습니다."));
  }, [fetchRankings]);

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ textAlign: "center" }}>
          {icon} {title}
        </h1>
        <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: 28 }}>{description}</p>

        {error && <p style={{ color: colors.pink, textAlign: "center" }}>{error}</p>}
        {!error && rankings === null && (
          <p style={{ textAlign: "center", color: colors.textMuted }}>불러오는 중...</p>
        )}
        {rankings?.length === 0 && (
          <p style={{ textAlign: "center", color: colors.textMuted }}>{emptyText}</p>
        )}

        <div style={{ ...cardStyle(), overflow: "hidden" }}>
          {rankings?.map((r, i) => (
            <Link
              key={r.rank}
              to={`/feed?author=${r.user_id}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: i < rankings.length - 1 ? `1px solid ${colors.creamDeep}` : "none",
                background: r.rank <= 3 ? colors.cream : "transparent",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "'Jua', sans-serif",
                    fontSize: r.rank <= 3 ? 20 : 15,
                    color: colors.brown,
                    minWidth: 28,
                    textAlign: "center",
                  }}
                >
                  {MEDALS[r.rank - 1] ?? r.rank}
                </span>
                <span style={{ fontSize: 15, color: colors.text }}>{r.nickname}</span>
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "#fff",
                  background: colors.green,
                  padding: "4px 12px",
                  borderRadius: radius.pill,
                }}
              >
                {r.count}
                {unit}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
