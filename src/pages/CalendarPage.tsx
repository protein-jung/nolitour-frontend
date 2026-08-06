import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyReviews, fetchMyVisits } from "../api/playgrounds";
import type { MyReview, MyVisit } from "../types/playground";
import { cardStyle, colors, primaryButtonStyle, radius } from "../styles/theme";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface DayEntries {
  visits: MyVisit[];
  reviews: MyReview[];
}

export function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<MyVisit[] | null>(null);
  const [reviews, setReviews] = useState<MyReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState(() => dateKey(new Date()));

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchMyVisits(), fetchMyReviews()])
      .then(([v, r]) => {
        setVisits(v);
        setReviews(r);
      })
      .catch(() => setError("놀이터 기록을 불러오지 못했습니다."));
  }, [user]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, DayEntries>();
    const ensure = (key: string) => {
      let entry = map.get(key);
      if (!entry) {
        entry = { visits: [], reviews: [] };
        map.set(key, entry);
      }
      return entry;
    };
    visits?.forEach((v) => ensure(dateKey(new Date(v.created_at))).visits.push(v));
    reviews?.forEach((r) => ensure(dateKey(new Date(r.created_at))).reviews.push(r));
    return map;
  }, [visits, reviews]);

  if (!user) {
    return (
      <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "80px auto", padding: 32, textAlign: "center" }}>
          <p>놀이터린더는 로그인 후 이용할 수 있습니다.</p>
          <button type="button" onClick={() => navigate("/login")} style={primaryButtonStyle()}>
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const todayKey = dateKey(new Date());

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selected = entriesByDate.get(selectedKey);
  const selectedDate = new Date(`${selectedKey}T00:00:00`);
  const selectedLabel = selectedDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1>🗓 놀이터린더</h1>
        <p style={{ color: colors.textMuted, marginBottom: 24 }}>
          다녀왔거나 후기를 남긴 놀이터를 달력으로 확인해보세요.
        </p>

        {error && <p style={{ color: colors.pink }}>{error}</p>}
        {!error && (visits === null || reviews === null) && <p>불러오는 중...</p>}

        {visits !== null && reviews !== null && (
          <>
            <div
              style={{
                ...cardStyle(),
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
                  style={monthNavButtonStyle}
                >
                  ◀
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 19 }}>
                    {year}년 {monthIndex + 1}월
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                      setSelectedKey(dateKey(now));
                    }}
                    style={{ ...monthNavButtonStyle, fontSize: 12, padding: "4px 10px" }}
                  >
                    오늘
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
                  style={monthNavButtonStyle}
                >
                  ▶
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {WEEKDAY_LABELS.map((label) => (
                  <div
                    key={label}
                    style={{ textAlign: "center", fontSize: 12, color: colors.textMuted, padding: "4px 0" }}
                  >
                    {label}
                  </div>
                ))}
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const key = dateKey(d);
                  const dayEntries = entriesByDate.get(key);
                  const hasVisit = !!dayEntries?.visits.length;
                  const hasReview = !!dayEntries?.reviews.length;
                  const isSelected = key === selectedKey;
                  const isToday = key === todayKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedKey(key)}
                      style={{
                        aspectRatio: "1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        borderRadius: radius.sm,
                        border: isSelected
                          ? `2px solid ${colors.green}`
                          : isToday
                            ? `2px solid ${colors.creamDeep}`
                            : "2px solid transparent",
                        background: isSelected ? "#f0f8e8" : "transparent",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        padding: 2,
                      }}
                    >
                      <span style={{ fontSize: 13, color: isToday ? colors.greenDark : colors.text }}>
                        {d.getDate()}
                      </span>
                      <span style={{ fontSize: 10, minHeight: 12 }}>
                        {hasVisit ? "👣" : ""}
                        {hasReview ? "⭐" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 14, fontSize: 12, color: colors.textMuted, display: "flex", gap: 16 }}>
                <span>👣 다녀온 놀이터</span>
                <span>⭐ 후기 남긴 놀이터</span>
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 20, marginTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>{selectedLabel}</h3>
              {!selected || (selected.visits.length === 0 && selected.reviews.length === 0) ? (
                <p style={{ color: colors.textMuted }}>이 날짜에 남긴 기록이 없어요.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selected.visits.map((v) => (
                    <Link
                      key={v.id}
                      to={`/map?playground=${v.playground_id}`}
                      style={{
                        ...cardStyle(),
                        padding: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        textDecoration: "none",
                        color: colors.text,
                      }}
                    >
                      <span>👣</span>
                      <span style={{ fontWeight: 700 }}>{v.playground_name}</span>
                      <span style={{ marginLeft: "auto", fontSize: 12, color: colors.textMuted }}>다녀옴</span>
                    </Link>
                  ))}
                  {selected.reviews.map((r) => (
                    <Link
                      key={r.id}
                      to={`/map?playground=${r.playground_id}`}
                      style={{
                        ...cardStyle(),
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        textDecoration: "none",
                        color: colors.text,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span>⭐</span>
                        <span style={{ fontWeight: 700 }}>{r.playground_name}</span>
                        {r.rating && (
                          <span style={{ marginLeft: "auto", fontSize: 12, color: colors.yellow }}>
                            {"★".repeat(r.rating)}
                            {"☆".repeat(5 - r.rating)}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>{r.content}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const monthNavButtonStyle = {
  border: "none",
  background: colors.cream,
  color: colors.brown,
  borderRadius: radius.pill,
  padding: "6px 14px",
  fontFamily: "'Jua', sans-serif",
  fontSize: 14,
  cursor: "pointer",
};
