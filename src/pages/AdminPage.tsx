import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  deletePlaygroundAdmin,
  fetchAdminPlaygrounds,
  fetchAdminStats,
  fetchAdminUsers,
  setUserAdminRole,
  unverifyPlaygroundAdmin,
  verifyPlaygroundAdmin,
  type AdminStats,
  type AdminUser,
} from "../api/admin";
import type { Playground } from "../types/playground";
import { cardStyle, colors, primaryButtonStyle, radius } from "../styles/theme";

type PlaygroundFilter = "pending" | "verified" | "all";

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [playgroundFilter, setPlaygroundFilter] = useState<PlaygroundFilter>("pending");
  const [playgroundSearch, setPlaygroundSearch] = useState("");
  const [playgrounds, setPlaygrounds] = useState<Playground[] | null>(null);

  const [users, setUsers] = useState<AdminUser[] | null>(null);

  const isAdmin = Boolean(user?.is_admin);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAdminStats().then(setStats).catch(() => setError("통계를 불러오지 못했습니다."));
    fetchAdminUsers().then(setUsers).catch(() => setError("회원 목록을 불러오지 못했습니다."));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const isVerified = playgroundFilter === "all" ? undefined : playgroundFilter === "verified";
    fetchAdminPlaygrounds(isVerified)
      .then(setPlaygrounds)
      .catch(() => setError("놀이터 목록을 불러오지 못했습니다."));
  }, [isAdmin, playgroundFilter]);

  const visiblePlaygrounds = playgrounds?.filter(
    (p) =>
      !playgroundSearch.trim() ||
      p.name.includes(playgroundSearch) ||
      p.address.includes(playgroundSearch),
  );

  async function handleVerify(p: Playground) {
    setBusyId(p.id);
    try {
      await verifyPlaygroundAdmin(p.id);
      if (playgroundFilter === "pending") {
        setPlaygrounds((prev) => prev?.filter((pg) => pg.id !== p.id) ?? null);
      } else {
        setPlaygrounds((prev) => prev?.map((pg) => (pg.id === p.id ? { ...pg, is_verified: true } : pg)) ?? null);
      }
      setStats((prev) => (prev ? { ...prev, pending_playgrounds: prev.pending_playgrounds - 1 } : prev));
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnverify(p: Playground) {
    setBusyId(p.id);
    try {
      await unverifyPlaygroundAdmin(p.id);
      if (playgroundFilter === "verified") {
        setPlaygrounds((prev) => prev?.filter((pg) => pg.id !== p.id) ?? null);
      } else {
        setPlaygrounds((prev) => prev?.map((pg) => (pg.id === p.id ? { ...pg, is_verified: false } : pg)) ?? null);
      }
      setStats((prev) => (prev ? { ...prev, pending_playgrounds: prev.pending_playgrounds + 1 } : prev));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeletePlayground(p: Playground) {
    setBusyId(p.id);
    try {
      await deletePlaygroundAdmin(p.id);
      setPlaygrounds((prev) => prev?.filter((pg) => pg.id !== p.id) ?? null);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              total_playgrounds: prev.total_playgrounds - 1,
              pending_playgrounds: p.is_verified ? prev.pending_playgrounds : prev.pending_playgrounds - 1,
            }
          : prev,
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleUserAdmin(u: AdminUser) {
    setBusyId(u.id);
    try {
      const updated = await setUserAdminRole(u.id, !u.is_admin);
      setUsers((prev) => prev?.map((row) => (row.id === u.id ? updated : row)) ?? null);
    } finally {
      setBusyId(null);
    }
  }

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
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1>관리자</h1>
        {error && <p style={{ color: colors.pink }}>{error}</p>}

        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
            <StatCard label="전체 놀이터" value={stats.total_playgrounds} color={colors.green} />
            <StatCard label="검수 대기" value={stats.pending_playgrounds} color={colors.pink} />
            <StatCard label="회원 수" value={stats.total_users} color={colors.blue} />
            <StatCard label="댓글·후기" value={stats.total_comments} color={colors.yellow} />
          </div>
        )}

        <h2>놀이터 관리</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {(["pending", "verified", "all"] as PlaygroundFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setPlaygroundFilter(f)}
              style={{
                border: "none",
                borderRadius: radius.pill,
                padding: "6px 16px",
                fontSize: 13,
                fontFamily: "'Jua', sans-serif",
                cursor: "pointer",
                background: playgroundFilter === f ? colors.green : "#fff",
                color: playgroundFilter === f ? "#fff" : colors.brown,
                boxShadow: playgroundFilter === f ? "none" : `inset 0 0 0 2px ${colors.creamDeep}`,
              }}
            >
              {{ pending: "검수 대기", verified: "승인됨", all: "전체" }[f]}
            </button>
          ))}
          <input
            value={playgroundSearch}
            onChange={(e) => setPlaygroundSearch(e.target.value)}
            placeholder="이름 또는 주소 검색"
            style={{
              marginLeft: "auto",
              padding: "6px 14px",
              borderRadius: radius.pill,
              border: `2px solid ${colors.creamDeep}`,
              fontSize: 13,
              minWidth: 180,
            }}
          />
        </div>

        {playgrounds === null && <p style={{ color: colors.textMuted }}>불러오는 중...</p>}
        {visiblePlaygrounds?.length === 0 && (
          <p style={{ color: colors.textMuted }}>조건에 맞는 놀이터가 없어요.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {visiblePlaygrounds?.map((p) => (
            <div key={p.id} style={{ ...cardStyle(), padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{p.name}</h3>
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
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {p.is_verified ? (
                  <button
                    type="button"
                    onClick={() => handleUnverify(p)}
                    disabled={busyId === p.id}
                    style={{
                      border: `2px solid ${colors.yellow}`,
                      background: "#fff",
                      color: colors.brown,
                      borderRadius: radius.pill,
                      padding: "8px 16px",
                      fontSize: 13,
                      fontFamily: "'Jua', sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    승인취소
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleVerify(p)}
                    disabled={busyId === p.id}
                    style={{ ...primaryButtonStyle(busyId === p.id), padding: "8px 16px", fontSize: 13 }}
                  >
                    승인
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`"${p.name}" 을(를) 삭제할까요?`)) handleDeletePlayground(p);
                  }}
                  disabled={busyId === p.id}
                  style={{
                    border: `2px solid ${colors.pink}`,
                    background: "#fff",
                    color: colors.pink,
                    borderRadius: radius.pill,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontFamily: "'Jua', sans-serif",
                    cursor: "pointer",
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2>회원 관리</h2>
        {users === null && <p style={{ color: colors.textMuted }}>불러오는 중...</p>}

        <div style={{ ...cardStyle(), overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.8fr", padding: "10px 18px", fontSize: 12, color: colors.textMuted, borderBottom: `2px solid ${colors.creamDeep}` }}>
            <span>닉네임 / 이름</span>
            <span>휴대폰</span>
            <span>제보 수</span>
            <span>가입일</span>
            <span>권한</span>
          </div>
          {users?.map((u) => (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.8fr",
                padding: "12px 18px",
                fontSize: 14,
                alignItems: "center",
                borderBottom: `1px solid ${colors.creamDeep}`,
              }}
            >
              <Link to={`/admin/users/${u.id}`} style={{ color: colors.greenDark, fontWeight: 600 }}>
                {u.nickname} <span style={{ color: colors.textMuted, fontSize: 12, fontWeight: 400 }}>({u.name})</span>
              </Link>
              <span style={{ color: colors.textMuted }}>{u.phone}</span>
              <span>{u.playground_count}건</span>
              <span style={{ color: colors.textMuted }}>{new Date(u.created_at).toLocaleDateString()}</span>
              <button
                type="button"
                onClick={() => handleToggleUserAdmin(u)}
                disabled={busyId === u.id || u.id === user.id}
                title={u.id === user.id ? "자기 자신의 권한은 변경할 수 없어요" : undefined}
                style={{
                  border: "none",
                  borderRadius: radius.pill,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontFamily: "'Jua', sans-serif",
                  cursor: u.id === user.id ? "default" : "pointer",
                  background: u.is_admin ? colors.blue : colors.cream,
                  color: u.is_admin ? "#fff" : colors.brown,
                  opacity: u.id === user.id ? 0.5 : 1,
                  justifySelf: "start",
                }}
              >
                {u.is_admin ? "관리자" : "일반"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ ...cardStyle(), padding: 18, textAlign: "center" }}>
      <div style={{ fontSize: 28, fontFamily: "'Jua', sans-serif", color }}>{value}</div>
      <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>{label}</div>
    </div>
  );
}
