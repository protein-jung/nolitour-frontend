import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchFeed } from "../api/feed";
import { fetchUserProfile } from "../api/users";
import {
  createCommentReply,
  deleteCommentReply,
  fetchCommentReplies,
  likeComment,
  unlikeComment,
} from "../api/playgrounds";
import type { CommentReply, FeedItem } from "../types/playground";
import type { PublicUserProfile } from "../types/user";
import { AGE_GROUP_LABEL, RISK_TAG_LABEL } from "../types/playground";
import { colors, fonts, primaryButtonStyle, radius, shadow } from "../styles/theme";
import { Tag, StarDisplay, AvatarCircle, IconCards, IconGrid, IconChatBubble, IconPin } from "../components/Shared";
import { FeedMapToggle } from "../components/FeedMapToggle";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime } from "../lib/time";

const PAGE_SIZE = 20;
const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/api\/v1\/?$/, "");

function viewToggleStyle(active: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: `2px solid ${active ? colors.green : colors.creamDeep}`,
    background: active ? colors.green : "#fff",
    color: active ? "#fff" : colors.brown,
    borderRadius: radius.pill,
    padding: "6px 14px",
    fontSize: 13,
    fontFamily: fonts.ui,
    cursor: "pointer",
  };
}

export function FeedPage() {
  const [searchParams] = useSearchParams();
  const authorId = searchParams.get("author") ?? undefined;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "grid">("card");
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const feedListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    setViewMode("card");
    setProfile(null);
    loadMore(0);
    if (authorId) {
      fetchUserProfile(authorId)
        .then(setProfile)
        .catch(() => {});
    }
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

  function goToItem(itemId: string) {
    setViewMode("card");
    requestAnimationFrame(() => {
      document.getElementById(`feed-item-${itemId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  const storyAuthors = authorId
    ? []
    : items.reduce<{ id: string; nickname: string }[]>((acc, item) => {
        if (!acc.some((a) => a.id === item.author_id)) {
          acc.push({ id: item.author_id, nickname: item.author_nickname });
        }
        return acc;
      }, []).slice(0, 15);

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div className="feed-page-inner" style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 80px" }}>
        <div className="feed-toggle-row" style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <FeedMapToggle active="feed" />
        </div>

        {storyAuthors.length > 0 && (
          <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "2px 2px 18px" }}>
            {storyAuthors.map((a) => (
              <Link
                key={a.id}
                to={`/feed?author=${a.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  textDecoration: "none",
                  flexShrink: 0,
                  width: 60,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    padding: 2,
                    borderRadius: "50%",
                    border: `2px solid ${colors.pink}`,
                  }}
                >
                  <AvatarCircle nickname={a.nickname} size={52} />
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: colors.text,
                    maxWidth: 60,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.nickname}
                </span>
              </Link>
            ))}
          </div>
        )}

        {authorId && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <AvatarCircle nickname={profile?.nickname ?? items[0]?.author_nickname ?? "?"} size={64} />
            <h2 style={{ margin: "8px 0 2px" }}>{profile?.nickname ?? items[0]?.author_nickname ?? "이용자"}님의 피드</h2>
            {profile && (
              <p style={{ margin: "0 0 8px", fontSize: 13, color: colors.textMuted }}>
                제보한 놀이터 {profile.playground_count} · 남긴 후기 {profile.comment_count}
              </p>
            )}
            <Link to="/feed" style={{ fontSize: 13, color: colors.textMuted }}>
              ← 전체 피드 보기
            </Link>

            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
              <button type="button" onClick={() => setViewMode("card")} style={viewToggleStyle(viewMode === "card")}>
                <IconCards size={14} /> 카드형
              </button>
              <button type="button" onClick={() => setViewMode("grid")} style={viewToggleStyle(viewMode === "grid")}>
                <IconGrid size={14} /> 그리드형
              </button>
            </div>
          </div>
        )}

        {error && <p style={{ color: colors.pink, textAlign: "center" }}>{error}</p>}

        {viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToItem(item.id)}
                style={{
                  aspectRatio: "1 / 1",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  overflow: "hidden",
                  background: item.images[0] ? "transparent" : colors.creamDeep,
                }}
              >
                {item.images[0] ? (
                  <img
                    src={`${apiBase}${item.images[0].image_url}`}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <span
                    style={{
                      display: "block",
                      padding: 6,
                      fontSize: 11,
                      color: colors.brown,
                      lineHeight: 1.4,
                      overflow: "hidden",
                    }}
                  >
                    {item.content.slice(0, 40)}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
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
        )}

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
  const [showHeartBurst, setShowHeartBurst] = useState(false);

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

  async function handleDoubleClickImage() {
    setShowHeartBurst(true);
    window.setTimeout(() => setShowHeartBurst(false), 700);
    if (!user || likedByMe || likeBusy) return;
    setLikeBusy(true);
    try {
      const status = await likeComment(item.playground_id, item.id);
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
      id={`feed-item-${item.id}`}
      className="feed-card"
      style={{
        background: "#fff",
        borderRadius: radius.lg,
        boxShadow: shadow,
        border: `1px solid ${colors.creamDeep}`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 8px" }}>
        <Link to={`/feed?author=${item.author_id}`}>
          <AvatarCircle nickname={item.author_nickname} size={36} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/feed?author=${item.author_id}`} style={{ textDecoration: "none" }}>
            <strong style={{ fontSize: 14, color: colors.brown }}>{item.author_nickname}</strong>
          </Link>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: colors.textMuted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.playground_name} · {formatRelativeTime(item.created_at)}
          </p>
        </div>
        {item.rating && <StarDisplay rating={item.rating} />}
      </div>

      {item.images.length > 0 ? (
        <div
          onDoubleClick={handleDoubleClickImage}
          style={{ position: "relative", display: "flex", overflowX: "auto", scrollSnapType: "x mandatory" }}
        >
          {item.images.map((img) => (
            <img
              key={img.id}
              src={`${apiBase}${img.image_url}`}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                flex: "0 0 100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                scrollSnapAlign: "start",
              }}
            />
          ))}
          {showHeartBurst && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 72,
                filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.35))",
                animation: "heartBurst 0.7s ease-out",
                pointerEvents: "none",
              }}
            >
              ❤️
            </span>
          )}
        </div>
      ) : (
        <p style={{ margin: "0 16px 8px", fontSize: 12, color: colors.textMuted }}>{item.playground_address}</p>
      )}

      <div style={{ padding: "12px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
              fontFamily: fonts.ui,
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
              fontFamily: fonts.ui,
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            <IconChatBubble size={14} /> 댓글 {replyCount}
          </button>
          <Link
            to={`/map?playground=${item.playground_id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginLeft: "auto",
              fontSize: 13,
              color: colors.greenDark,
              fontFamily: fonts.ui,
              textDecoration: "none",
            }}
          >
            <IconPin size={14} /> 지도에서 보기
          </Link>
        </div>

        <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6, color: colors.text }}>
          <Link to={`/feed?author=${item.author_id}`} style={{ textDecoration: "none" }}>
            <strong style={{ color: colors.brown }}>{item.author_nickname}</strong>
          </Link>{" "}
          {item.content}
        </p>

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

        {repliesOpen && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.creamDeep}` }}>
            {replies === null && <p style={{ fontSize: 12, color: colors.textMuted }}>불러오는 중...</p>}
            {replies?.length === 0 && <p style={{ fontSize: 12, color: colors.textMuted }}>아직 댓글이 없어요.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              {replies?.map((r) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    <Link to={`/feed?author=${r.author_id}`} style={{ textDecoration: "none" }}>
                      <strong style={{ color: colors.brown }}>{r.author_nickname}</strong>
                    </Link>{" "}
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
