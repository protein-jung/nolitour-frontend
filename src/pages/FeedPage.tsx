import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchFeed } from "../api/feed";
import {
  createCommentReply,
  deleteCommentReply,
  fetchCommentReplies,
  likeComment,
  unlikeComment,
} from "../api/playgrounds";
import type { CommentReply, FeedItem } from "../types/playground";
import { AGE_GROUP_LABEL, RISK_TAG_LABEL } from "../types/playground";
import { colors, primaryButtonStyle, radius, shadow } from "../styles/theme";
import { Tag, StarDisplay } from "../components/Shared";
import { FeedMapToggle } from "../components/FeedMapToggle";
import { useAuth } from "../context/AuthContext";

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
  const feedListRef = useRef<HTMLDivElement>(null);

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

  function handleFeedScroll() {
    const el = feedListRef.current;
    if (!el || loading || !hasMore) return;
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - el.clientWidth * 0.5;
    if (nearEnd) loadMore(offset);
  }

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div className="feed-page-inner" style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 80px" }}>
        <div className="feed-toggle-row" style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
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

        <div
          ref={feedListRef}
          onScroll={handleFeedScroll}
          className="feed-list"
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
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
          <div className="feed-load-more" style={{ textAlign: "center", marginTop: 24 }}>
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [likeCount, setLikeCount] = useState(item.like_count);
  const [likedByMe, setLikedByMe] = useState(item.liked_by_me);
  const [likeBusy, setLikeBusy] = useState(false);

  const [replyCount, setReplyCount] = useState(item.reply_count);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replies, setReplies] = useState<CommentReply[] | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function toggleLike() {
    if (!user) {
      navigate("/login");
      return;
    }
    setLikeBusy(true);
    try {
      const status = likedByMe
        ? await unlikeComment(item.playground_id, item.id)
        : await likeComment(item.playground_id, item.id);
      setLikeCount(status.like_count);
      setLikedByMe(status.liked_by_me);
    } finally {
      setLikeBusy(false);
    }
  }

  function toggleReplies() {
    setRepliesOpen((prev) => {
      const next = !prev;
      if (next && replies === null) {
        fetchCommentReplies(item.playground_id, item.id).then(setReplies);
      }
      return next;
    });
  }

  async function submitReply(e: FormEvent) {
    e.preventDefault();
    if (!user || !replyText.trim()) return;
    setSubmitting(true);
    try {
      const reply = await createCommentReply(item.playground_id, item.id, replyText.trim());
      setReplies((prev) => [...(prev ?? []), reply]);
      setReplyCount((c) => c + 1);
      setReplyText("");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeReply(replyId: string) {
    await deleteCommentReply(item.playground_id, item.id, replyId);
    setReplies((prev) => prev?.filter((r) => r.id !== replyId) ?? null);
    setReplyCount((c) => Math.max(0, c - 1));
  }

  return (
    <article
      className="feed-card"
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

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <button
            type="button"
            onClick={toggleLike}
            disabled={likeBusy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              fontFamily: "'Jua', sans-serif",
              fontSize: 13,
              color: likedByMe ? colors.pink : colors.textMuted,
            }}
          >
            {likedByMe ? "♥" : "♡"} 좋아요 {likeCount}
          </button>
          <button
            type="button"
            onClick={toggleReplies}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              fontFamily: "'Jua', sans-serif",
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            💬 댓글 {replyCount}
          </button>
          <Link
            to={`/map?playground=${item.playground_id}`}
            style={{
              marginLeft: "auto",
              fontSize: 13,
              color: colors.greenDark,
              fontFamily: "'Jua', sans-serif",
              textDecoration: "none",
            }}
          >
            🗺 지도에서 보기
          </Link>
        </div>

        {repliesOpen && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.creamDeep}` }}>
            {replies === null && (
              <p style={{ fontSize: 12, color: colors.textMuted }}>불러오는 중...</p>
            )}
            {replies?.length === 0 && (
              <p style={{ fontSize: 12, color: colors.textMuted }}>아직 댓글이 없어요.</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              {replies?.map((r) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    <strong style={{ color: colors.brown }}>{r.author_nickname}</strong>{" "}
                    <span style={{ color: colors.text }}>{r.content}</span>
                  </p>
                  {user?.id === r.author_id && (
                    <button
                      type="button"
                      onClick={() => removeReply(r.id)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: colors.textMuted,
                        fontSize: 11,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>

            {user ? (
              <form onSubmit={submitReply} style={{ display: "flex", gap: 8 }}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="댓글을 남겨보세요"
                  style={{
                    flex: 1,
                    padding: "7px 12px",
                    borderRadius: radius.pill,
                    border: `2px solid ${colors.creamDeep}`,
                    fontSize: 13,
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  style={{ ...primaryButtonStyle(submitting), padding: "7px 16px", fontSize: 13 }}
                >
                  등록
                </button>
              </form>
            ) : (
              <p style={{ fontSize: 12, color: colors.textMuted }}>
                댓글을 남기려면{" "}
                <Link to="/login" style={{ color: colors.greenDark }}>
                  로그인
                </Link>
                해주세요.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
