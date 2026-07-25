import type { Playground } from "../types/playground";
import { AGE_GROUP_LABEL, PLAYGROUND_TYPE_LABEL } from "../types/playground";
import { colors, radius, shadow } from "../styles/theme";
import { Tag, VisitStamp } from "./Shared";
import { formatDistance } from "../lib/geo";

type PlaygroundWithDistance = Playground & { distanceM?: number | null };

interface PlaygroundListViewProps {
  playgrounds: PlaygroundWithDistance[];
  onSelect: (playground: Playground) => void;
  nickname?: string;
}

export function PlaygroundListView({ playgrounds, onSelect, nickname }: PlaygroundListViewProps) {
  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "76px 16px 24px",
        boxSizing: "border-box",
        background: colors.cream,
      }}
    >
      {playgrounds.length === 0 && (
        <p style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>
          조건에 맞는 놀이터가 없어요.
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640, margin: "0 auto" }}>
        {playgrounds.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              textAlign: "left",
              background: "#fff",
              border: "none",
              borderRadius: radius.md,
              boxShadow: shadow,
              padding: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 15, color: colors.text }}>{p.name}</strong>
                {p.reviewed_by_me && <span title="후기 남김">🏆</span>}
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textMuted }}>{p.address}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {p.type && <Tag color={colors.green}>{PLAYGROUND_TYPE_LABEL[p.type]}</Tag>}
                {p.age_groups?.slice(0, 2).map((ag) => (
                  <Tag key={ag} color={colors.blue}>
                    {AGE_GROUP_LABEL[ag]}
                  </Tag>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {typeof p.distanceM === "number" && (
                <span
                  style={{
                    fontSize: 12,
                    color: colors.brown,
                    background: colors.cream,
                    padding: "3px 10px",
                    borderRadius: radius.pill,
                    whiteSpace: "nowrap",
                  }}
                >
                  📍 {formatDistance(p.distanceM)}
                </span>
              )}
              {p.visited_by_me && nickname && <VisitStamp nickname={nickname} size="sm" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
