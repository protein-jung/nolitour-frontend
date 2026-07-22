import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  deletePlaygroundAdmin,
  fetchAdminPlaygrounds,
  fetchAdminStats,
  verifyPlaygroundAdmin,
  type AdminStats,
} from "../api/admin";
import type { Playground } from "../types/playground";
import { cardStyle, colors, primaryButtonStyle, radius } from "../styles/theme";

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<Playground[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = Boolean(user?.is_admin);

  useEffect(() => {
    if (!isAdmin) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  function refresh() {
    fetchAdminStats().then(setStats).catch(() => setError("통계를 불러오지 못했습니다."));
    fetchAdminPlaygrounds(false)
      .then(setPending)
      .catch(() => setError("검수 대기 목록을 불러오지 못했습니다."));
  }

  async function handleVerify(id: string) {
    setBusyId(id);
    try {
      await verifyPlaygroundAdmin(id);
      setPending((prev) => prev?.filter((p) => p.id !== id) ?? null);
      setStats((prev) =>
        prev
          ? { ...prev, pending_playgrounds: prev.pending_playgrounds - 1 }
          : prev,
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await deletePlaygroundAdmin(id);
      setPending((prev) => prev?.filter((p) => p.id !== id) ?? null);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pending_playgrounds: prev.pending_playgrounds - 1,
              total_playgrounds: prev.total_playgrounds - 1,
            }
          : prev,
      );
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

        <h2>검수 대기 놀이터</h2>
        {pending === null && <p style={{ color: colors.textMuted }}>불러오는 중...</p>}
        {pending?.length === 0 && <p style={{ color: colors.textMuted }}>검수 대기 중인 놀이터가 없어요.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pending?.map((p) => (
            <div key={p.id} style={{ ...cardStyle(), padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{p.name}</h3>
                <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>{p.address}</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleVerify(p.id)}
                  disabled={busyId === p.id}
                  style={{ ...primaryButtonStyle(busyId === p.id), padding: "8px 16px", fontSize: 13 }}
                >
                  승인
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`"${p.name}" 을(를) 삭제할까요?`)) handleDelete(p.id);
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
