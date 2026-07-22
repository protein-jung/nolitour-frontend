import { useEffect, useRef, useState } from "react";
import { fetchTopReporters } from "../api/rankings";
import type { ReporterRankingItem } from "../types/ranking";
import { colors, radius, shadow } from "../styles/theme";

const MEDALS = ["🥇", "🥈", "🥉"];

export function ReporterRankingButton() {
  const [open, setOpen] = useState(false);
  const [rankings, setRankings] = useState<ReporterRankingItem[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        fetchTopReporters(10).then(setRankings);
      }
      return next;
    });
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          border: "none",
          background: "transparent",
          color: colors.brown,
          fontFamily: "'Jua', sans-serif",
          fontSize: 15,
          padding: "6px 14px",
          borderRadius: radius.pill,
          cursor: "pointer",
        }}
      >
        🏆 제보왕
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 6,
            width: 240,
            background: "#fff",
            border: `2px solid ${colors.creamDeep}`,
            borderRadius: radius.md,
            boxShadow: shadow,
            padding: 12,
            zIndex: 20,
          }}
        >
          <p style={{ margin: "0 0 8px", fontFamily: "'Jua', sans-serif", fontSize: 14, color: colors.brown }}>
            제보왕 TOP 10
          </p>
          {rankings === null && (
            <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>불러오는 중...</p>
          )}
          {rankings?.length === 0 && (
            <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>아직 제보가 없어요.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rankings?.map((r) => (
              <div
                key={r.rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: colors.text }}>
                  {MEDALS[r.rank - 1] ?? `${r.rank}.`} {r.nickname}
                </span>
                <span style={{ color: colors.textMuted }}>{r.count}건</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
