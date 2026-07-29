import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchFeed } from "../api/feed";
import type { FeedItem } from "../types/playground";
import { AGE_GROUP_LABEL, RISK_TAG_LABEL } from "../types/playground";
import { colors, primaryButtonStyle, radius, shadow } from "../styles/theme";
import { Tag, StarDisplay } from "../components/Shared";
import { FeedMapToggle } from "../components/FeedMapToggle";

const PAGE_SIZE = 20;
const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/api\/v1\/?$/, "");

export function FeedPage() {
  const [searchParams] = useSearchParams();
  const authorId = searchParams.get("author") ?? undefined;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    loadMore(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorId]);

  function loadMore(fromOffset: number) {
    setLoading(true);
    fetchFeed(PAGE_SIZE, fromOffset, authorId)
      .then((page) => {
        setItems((prev) => (fromOffset === 0 ? page : [...prev, ...page]));
        setHasMore(page.length === PAGE_SIZE);
        setOffset(fromOffset + page.length);
      })
      .catch(() => setError("피드를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 80px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <FeedMapToggle active="feed" />
        </div>

        {authorId && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ marginBottom: 4 }}>
              {items[0]?.author_nickname ?? "이용자"}님의 피드
            </h2>
            <Link to="/feed" style={{ fontSize: 13, color: colors.textMuted }}>
              ← 전체 피드 보기
            </Link>
          </div>
        )}

        {error && <p style={{ color: colors.pink, textAlign: "center" }}>{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {items.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>

        {items.length === 0 && !loading && !error && (
          <p style={{ textAlign: "center", color: colors.textMuted, marginTop: 40 }}>
            아직 등록된 후기가 없어요. 지도에서 놀이터를 찾아 첫 후기를 남겨보세요!
          </p>
        )}

        {hasMore && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              type="button"
              onClick={() => loadMore(offset)}
              disabled={loading}
              style={{ ...primaryButtonStyle(loading), fontSize: 14, padding: "10px 22px" }}
            >
              {loading ? "불러오는 중..." : "더 보기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <article
      style={{
        background: "#fff",
        borderRadius: radius.lg,
        boxShadow: shadow,
        border: `1px solid ${colors.creamDeep}`,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 14, color: colors.brown }}>{item.author_nickname}</strong>
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
        {item.rating && (
          <p style={{ margin: "4px 0 0" }}>
            <StarDisplay rating={item.rating} />
          </p>
        )}
        <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 700, color: colors.text }}>
          {item.playground_name}
        </p>
        <p style={{ margin: "2px 0 8px", fontSize: 12, color: colors.textMuted }}>
          {item.playground_address}
        </p>
      </div>

      {item.images.length > 0 && (
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
          }}
        >
          {item.images.map((img) => (
            <img
              key={img.id}
              src={`${apiBase}${img.image_url}`}
              alt=""
              style={{
                width: "100%",
                flex: "0 0 100%",
                height: 280,
                objectFit: "cover",
                scrollSnapAlign: "start",
              }}
            />
          ))}
        </div>
      )}

      <div style={{ padding: 16 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: colors.text }}>{item.content}</p>

        {((item.recommended_ages && item.recommended_ages.length > 0) ||
          (item.risk_tags && item.risk_tags.length > 0)) && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
            {item.recommended_ages?.map((ag) => (
              <Tag key={ag} color={colors.blue}>
                {AGE_GROUP_LABEL[ag]}
              </Tag>
            ))}
            {item.risk_tags?.map((risk) => (
              <Tag key={risk} color={colors.pink}>
                ⚠ {RISK_TAG_LABEL[risk]}
              </Tag>
            ))}
          </div>
        )}

        <Link
          to={`/?playground=${item.playground_id}`}
          style={{
            display: "inline-block",
            marginTop: 12,
            fontSize: 13,
            color: colors.greenDark,
            fontFamily: "'Jua', sans-serif",
            textDecoration: "none",
          }}
        >
          🗺 지도에서 보기
        </Link>
      </div>
    </article>
  );
}
