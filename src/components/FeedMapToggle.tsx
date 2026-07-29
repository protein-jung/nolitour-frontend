import { Link } from "react-router-dom";
import { colors, radius, shadow } from "../styles/theme";

export function FeedMapToggle({ active }: { active: "feed" | "map" }) {
  return (
    <div
      className="feed-map-toggle"
      style={{
        display: "inline-flex",
        background: "#fff",
        borderRadius: radius.pill,
        boxShadow: shadow,
        padding: 4,
        gap: 4,
      }}
    >
      <Link to="/feed" style={tabStyle(active === "feed")}>
        피드
      </Link>
      <Link to="/" style={tabStyle(active === "map")}>
        지도
      </Link>
    </div>
  );
}

function tabStyle(active: boolean) {
  return {
    padding: "8px 20px",
    borderRadius: radius.pill,
    fontFamily: "'Jua', sans-serif",
    fontSize: 14,
    textDecoration: "none",
    background: active ? colors.green : "transparent",
    color: active ? "#fff" : colors.brown,
  } as const;
}
