import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserActivity, type UserActivity } from "../api/admin";
import { cardStyle, colors, primaryButtonStyle, radius } from "../styles/theme";

export function AdminUserDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = Boolean(user?.is_admin);

  useEffect(() => {
    if (!isAdmin || !id) return;
    fetchUserActivity(id)
      .then(setActivity)
      .catch(() => setError("회원 활동 내역을 불러오지 못했습니다."));
  }, [isAdmin, id]);

  if (!user) {
    return (
      <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "80px auto", padding: 32, textAlign: "center" }}>
          <p>관리자 페이지는 로그인 후 이용할 수 있습니다.</p>
          <button type="button" onClick={() => navigate("/login")} style={primaryButtonStyle()}>
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "80px auto", padding: 32, textAlign: "center" }}>
          <p>관리자 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <Link to="/admin" style={{ fontSize: 13, color: colors.textMuted }}>
          ← 관리자로 돌아가기
        </Link>

        {error && <p style={{ color: colors.pink }}>{error}</p>}
        {!activity && !error && <p style={{ color: colors.textMuted }}>불러오는 중...</p>}

        {activity && (
          <>
            <h1 style={{ marginBottom: 4 }}>
              {activity.user.nickname}{" "}
              {activity.user.is_admin && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "3px 10px",
                    borderRadius: radius.pill,
                    background: colors.blue,
                    color: "#fff",
                    verticalAlign: "middle",
                  }}
                >
                  관리자
                </span>
              )}
            </h1>
            <p style={{ color: colors.textMuted, marginBottom: 28 }}>
              {activity.user.name} · {activity.user.phone} · 가입일{" "}
              {new Date(activity.user.created_at).toLocaleDateString()}
            </p>

            <h2>등록한 놀이터 ({activity.submitted_playgrounds.length})</h2>
            {activity.submitted_playgrounds.length === 0 && (
              <p style={{ color: colors.textMuted }}>등록한 놀이터가 없어요.</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {activity.submitted_playgrounds.map((p) => (
                <div key={p.id} style={{ ...cardStyle(), padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 14 }}>{p.name}</strong>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: radius.pill,
                        background: p.is_verified ? colors.green : colors.creamDeep,
                        color: p.is_verified ? "#fff" : colors.brown,
                      }}
                    >
                      {p.is_verified ? "승인됨" : "검수대기"}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textMuted }}>{p.address}</p>
                </div>
              ))}
            </div>

            <h2>작성한 댓글·후기 ({activity.comments.length})</h2>
            {activity.comments.length === 0 && (
              <p style={{ color: colors.textMuted }}>작성한 댓글·후기가 없어요.</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {activity.comments.map((c) => (
                <div key={c.id} style={{ ...cardStyle(), padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: 13, color: colors.brown }}>{c.playground_name}</strong>
                    <span style={{ fontSize: 12, color: colors.textMuted }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {c.rating && (
                    <p style={{ margin: "4px 0 0", color: colors.yellow, fontSize: 13 }}>
                      {"★".repeat(c.rating)}
                      <span style={{ color: colors.creamDeep }}>{"★".repeat(5 - c.rating)}</span>
                    </p>
                  )}
                  <p style={{ margin: "4px 0 0", fontSize: 14 }}>{c.content}</p>
                </div>
              ))}
            </div>

            <h2>좋아요한 놀이터 ({activity.liked_playgrounds.length})</h2>
            {activity.liked_playgrounds.length === 0 && (
              <p style={{ color: colors.textMuted }}>좋아요한 놀이터가 없어요.</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activity.liked_playgrounds.map((p) => (
                <div key={p.id} style={{ ...cardStyle(), padding: 14 }}>
                  <strong style={{ fontSize: 14 }}>{p.name}</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: colors.textMuted }}>{p.address}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
