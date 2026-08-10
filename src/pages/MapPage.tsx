import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { NaverMap, type LatLngLiteral } from "../components/NaverMap";
import { distanceMeters, formatDistance } from "../lib/geo";
import {
  checkInPlayground,
  createComment,
  deleteComment,
  fetchComments,
  fetchPlayground,
  fetchPlaygrounds,
  likePlayground,
  savePlayground,
  unlikePlayground,
  unsavePlayground,
  uploadCommentImage,
} from "../api/playgrounds";
import type { AgeGroup, EquipmentType, Playground, PlaygroundComment, RiskTag } from "../types/playground";
import { NAVBAR_HEIGHT } from "../components/NavBar";
import { colors, primaryButtonStyle, radius, shadow } from "../styles/theme";
import {
  ACCESS_LEVEL_LABEL,
  AGE_GROUP_LABEL,
  CONDITION_STATUS_LABEL,
  EQUIPMENT_LABEL,
  FENCE_LABEL,
  MOOD_TAG_LABEL,
  NATURE_FEATURE_LABEL,
  NEARBY_FACILITY_LABEL,
  PARKING_LABEL,
  PET_POLICY_LABEL,
  PLAYGROUND_SIZE_LABEL,
  PLAYGROUND_TYPE_LABEL,
  PLAY_DURATION_LABEL,
  RESTROOM_LABEL,
  RISK_TAG_LABEL,
  ROAD_SAFETY_LABEL,
  SHADE_LEVEL_LABEL,
  SMOKING_STATUS_LABEL,
  SPORTS_FACILITY_LABEL,
  SURFACE_TYPE_LABEL,
  WHEELED_ACCESS_LABEL,
} from "../types/playground";
import { useAuth } from "../context/AuthContext";
import { Tag, StarDisplay, StarPicker, VisitStamp } from "../components/Shared";
import { FeedMapToggle } from "../components/FeedMapToggle";
import { PlaygroundListView } from "../components/PlaygroundListView";
import { extractApiErrorMessage } from "../lib/apiError";

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/api\/v1\/?$/, "");

const AGE_GROUPS = Object.keys(AGE_GROUP_LABEL) as AgeGroup[];
const RISK_TAGS = Object.keys(RISK_TAG_LABEL) as RiskTag[];

const NATIONAL_CENTER: LatLngLiteral = { lat: 36.5, lng: 127.8 };
const NATIONAL_ZOOM = 7;
const NEARBY_ZOOM = 17;

export function MapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deepLinkPlaygroundId = searchParams.get("playground");

  const [mapReady, setMapReady] = useState(false);
  const [initialCenter, setInitialCenter] = useState<LatLngLiteral>(NATIONAL_CENTER);
  const [initialZoom, setInitialZoom] = useState(NATIONAL_ZOOM);
  const [myLocation, setMyLocation] = useState<LatLngLiteral | null>(null);

  useEffect(() => {
    if (deepLinkPlaygroundId) return;
    if (!navigator.geolocation) {
      setMapReady(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setInitialCenter(here);
        setInitialZoom(NEARBY_ZOOM);
        setMyLocation(here);
        setMapReady(true);
      },
      () => setMapReady(true),
      { timeout: 5000, maximumAge: 60000 },
    );
  }, [deepLinkPlaygroundId]);

  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [selected, setSelected] = useState<Playground | null>(null);
  const [comments, setComments] = useState<PlaygroundComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(0);
  const [commentAges, setCommentAges] = useState<AgeGroup[]>([]);
  const [commentRisks, setCommentRisks] = useState<RiskTag[]>([]);
  const [commentPhotos, setCommentPhotos] = useState<File[]>([]);
  const [showReviewExtras, setShowReviewExtras] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  useEffect(() => {
    if (!deepLinkPlaygroundId) return;
    fetchPlayground(deepLinkPlaygroundId).then((p) => {
      setSelected(p);
      setInitialCenter({ lat: p.latitude, lng: p.longitude });
      setInitialZoom(NEARBY_ZOOM);
      setMapReady(true);
    });
    fetchComments(deepLinkPlaygroundId).then(setComments);
  }, [deepLinkPlaygroundId]);

  const playgroundsWithDistance = useMemo(
    () =>
      playgrounds.map((p) => ({
        ...p,
        distanceM: myLocation ? distanceMeters(myLocation, { lat: p.latitude, lng: p.longitude }) : null,
      })),
    [playgrounds, myLocation],
  );

  const playgroundsForList = useMemo(() => {
    if (!myLocation) return playgroundsWithDistance;
    return [...playgroundsWithDistance].sort((a, b) => (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity));
  }, [playgroundsWithDistance, myLocation]);

  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAgeGroups, setFilterAgeGroups] = useState<AgeGroup[]>([]);
  const [filterShade, setFilterShade] = useState(false);
  const [filterParking, setFilterParking] = useState(false);
  const [filterRestroom, setFilterRestroom] = useState(false);
  const [filterSandPlay, setFilterSandPlay] = useState(false);
  const [filterWaterPlay, setFilterWaterPlay] = useState(false);
  const [sortPopular, setSortPopular] = useState(false);

  useEffect(() => {
    const equipment: EquipmentType[] = [
      ...(filterSandPlay ? (["sand_play"] as EquipmentType[]) : []),
      ...(filterWaterPlay ? (["water_play"] as EquipmentType[]) : []),
    ];
    fetchPlaygrounds(undefined, {
      ageGroup: filterAgeGroups,
      hasShade: filterShade,
      hasParking: filterParking,
      hasRestroom: filterRestroom,
      equipment,
      ...(sortPopular && { sort: "popular", limit: 50 }),
    })
      .then(setPlaygrounds)
      .catch(() => setError("놀이터 목록을 불러오지 못했습니다."));
  }, [filterAgeGroups, filterShade, filterParking, filterRestroom, filterSandPlay, filterWaterPlay, sortPopular]);

  function toggleFilterAgeGroup(ag: AgeGroup) {
    setFilterAgeGroups((prev) => (prev.includes(ag) ? prev.filter((v) => v !== ag) : [...prev, ag]));
  }

  const activeFilterCount =
    filterAgeGroups.length +
    [filterShade, filterParking, filterRestroom, filterSandPlay, filterWaterPlay].filter(Boolean).length;

  const handleSelect = useCallback((playground: Playground) => {
    fetchPlayground(playground.id).then(setSelected);
    fetchComments(playground.id).then(setComments);
    setCommentText("");
    setCommentRating(0);
    setCommentAges([]);
    setCommentRisks([]);
    setCommentPhotos([]);
    setShowReviewExtras(false);
    setCheckInError(null);
  }, []);

  const closeDetail = useCallback(() => setSelected(null), []);

  function toggleCommentAge(ag: AgeGroup) {
    setCommentAges((prev) => (prev.includes(ag) ? prev.filter((v) => v !== ag) : [...prev, ag]));
  }

  function toggleCommentRisk(risk: RiskTag) {
    setCommentRisks((prev) => (prev.includes(risk) ? prev.filter((v) => v !== risk) : [...prev, risk]));
  }

  const handleInteractionBlocked = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  async function toggleLike() {
    if (!selected || !user) return;
    const status = selected.liked_by_me
      ? await unlikePlayground(selected.id)
      : await likePlayground(selected.id);
    setSelected({ ...selected, like_count: status.like_count, liked_by_me: status.liked_by_me });
  }

  async function toggleSave() {
    if (!selected || !user) return;
    const status = selected.saved_by_me
      ? await unsavePlayground(selected.id)
      : await savePlayground(selected.id);
    setSelected({ ...selected, save_count: status.save_count, saved_by_me: status.saved_by_me });
  }

  function checkIn() {
    if (!selected || !user) return;
    if (!navigator.geolocation) {
      setCheckInError("이 브라우저는 위치 확인을 지원하지 않습니다.");
      return;
    }
    setCheckingIn(true);
    setCheckInError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await checkInPlayground(selected.id, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setSelected((prev) => (prev ? { ...prev, visited_by_me: result.visited_by_me } : prev));
          setPlaygrounds((prev) =>
            prev.map((p) => (p.id === selected.id ? { ...p, visited_by_me: result.visited_by_me } : p)),
          );
        } catch (e) {
          setCheckInError(extractApiErrorMessage(e, "체크인에 실패했어요. 잠시 후 다시 시도해주세요."));
        } finally {
          setCheckingIn(false);
        }
      },
      () => {
        setCheckInError("현재 위치를 가져오지 못했어요. 위치 권한을 확인해주세요.");
        setCheckingIn(false);
      },
      { timeout: 8000 },
    );
  }

  async function submitComment(e: FormEvent) {
    e.preventDefault();
    if (!selected || !commentText.trim()) return;
    let comment = await createComment(selected.id, {
      content: commentText.trim(),
      rating: commentRating > 0 ? commentRating : null,
      recommended_ages: commentAges.length ? commentAges : null,
      risk_tags: commentRisks.length ? commentRisks : null,
    });
    if (commentPhotos.length > 0) {
      const images = await Promise.all(
        commentPhotos.map((file) => uploadCommentImage(selected.id, comment.id, file)),
      );
      comment = { ...comment, images };
    }
    setComments((prev) => [...prev, comment]);
    setCommentText("");
    setCommentRating(0);
    setCommentAges([]);
    setCommentRisks([]);
    setCommentPhotos([]);
    setShowReviewExtras(false);
    const updated = await fetchPlayground(selected.id);
    setSelected(updated);
  }

  async function removeComment(commentId: string) {
    if (!selected) return;
    await deleteComment(selected.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setSelected({ ...selected, comment_count: Math.max(0, (selected.comment_count ?? 1) - 1) });
  }

  return (
    <div className="map-layout" style={{ display: "flex", height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
      <div className="map-canvas-wrap" style={{ flex: 1, position: "relative" }}>
        <div className="map-filter-wrap" style={{ position: "absolute", top: 12, left: 12, zIndex: 1, display: "flex", flexDirection: "column", gap: 8, maxWidth: 260 }}>
          <div style={{ display: "inline-flex", background: "#fff", borderRadius: radius.pill, boxShadow: shadow, padding: 4, gap: 4, alignSelf: "flex-start" }}>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              style={{
                border: "none",
                borderRadius: radius.pill,
                padding: "6px 14px",
                fontFamily: "'Jua', sans-serif",
                fontSize: 13,
                cursor: "pointer",
                background: viewMode === "map" ? colors.green : "transparent",
                color: viewMode === "map" ? "#fff" : colors.brown,
              }}
            >
              🗺 지도
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              style={{
                border: "none",
                borderRadius: radius.pill,
                padding: "6px 14px",
                fontFamily: "'Jua', sans-serif",
                fontSize: 13,
                cursor: "pointer",
                background: viewMode === "list" ? colors.green : "transparent",
                color: viewMode === "list" ? "#fff" : colors.brown,
              }}
            >
              📋 리스트
            </button>
          </div>

          {error && (
            <div
              style={{
                color: "#fff",
                background: colors.pink,
                padding: "8px 14px",
                borderRadius: radius.md,
                boxShadow: shadow,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => setSortPopular((v) => !v)}
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 6,
              border: "none",
              borderRadius: radius.pill,
              padding: "8px 16px",
              cursor: "pointer",
              fontFamily: "'Jua', sans-serif",
              fontSize: 13,
              boxShadow: shadow,
              background: sortPopular ? colors.pink : "#fff",
              color: sortPopular ? "#fff" : colors.brown,
            }}
          >
            🔥 인기순{sortPopular ? " (적용됨)" : ""}
          </button>

          <div style={{ background: "#fff", borderRadius: radius.md, boxShadow: shadow, padding: 12 }}>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              style={{
                border: "none",
                background: "transparent",
                fontFamily: "'Jua', sans-serif",
                fontSize: 14,
                color: colors.brown,
                cursor: "pointer",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                🔍 필터{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </span>
              <span>{filterOpen ? "▲" : "▼"}</span>
            </button>

            {filterOpen && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <p style={{ fontSize: 12, color: colors.textMuted, margin: "0 0 4px" }}>적합 연령</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {AGE_GROUPS.map((ag) => (
                      <label key={ag} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={filterAgeGroups.includes(ag)}
                          onChange={() => toggleFilterAgeGroup(ag)}
                        />
                        {AGE_GROUP_LABEL[ag]}
                      </label>
                    ))}
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={filterShade} onChange={(e) => setFilterShade(e.target.checked)} />
                  그늘 있음
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={filterParking} onChange={(e) => setFilterParking(e.target.checked)} />
                  주차 가능
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={filterRestroom} onChange={(e) => setFilterRestroom(e.target.checked)} />
                  화장실 있음
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={filterSandPlay} onChange={(e) => setFilterSandPlay(e.target.checked)} />
                  모래놀이 가능
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={filterWaterPlay} onChange={(e) => setFilterWaterPlay(e.target.checked)} />
                  물놀이 가능
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="map-toggle-wrap" style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
          <FeedMapToggle active="map" />
        </div>

        {viewMode === "map" ? (
          <>
            {!user && (
              <div
                className="map-guest-banner"
                style={{
                  position: "absolute",
                  top: 64,
                  right: 12,
                  zIndex: 1,
                  background: "#fff",
                  padding: "8px 14px",
                  borderRadius: radius.md,
                  boxShadow: shadow,
                  fontSize: 13,
                  color: colors.brown,
                  maxWidth: 240,
                }}
              >
                둘러보기만 가능해요. 확대/이동하거나 놀이터를 선택하려면 로그인해주세요.
              </div>
            )}
            {mapReady && (
              <NaverMap
                playgrounds={playgroundsWithDistance}
                onSelect={handleSelect}
                onInteractionBlocked={user ? undefined : handleInteractionBlocked}
                initialCenter={initialCenter}
                initialZoom={initialZoom}
                currentLocation={myLocation}
              />
            )}

            {user && (
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 12,
                  zIndex: 1,
                  background: "#fff",
                  padding: "6px 12px",
                  borderRadius: radius.pill,
                  boxShadow: shadow,
                  fontSize: 12,
                  color: colors.brown,
                }}
              >
                🏆 후기 · 👣 왔다감 표시
              </div>
            )}
          </>
        ) : (
          <PlaygroundListView playgrounds={playgroundsForList} onSelect={handleSelect} nickname={user?.nickname} />
        )}
      </div>
      {selected && <div className="map-aside-backdrop" onClick={closeDetail} />}
      {selected && (
        <aside
          className="map-aside"
          style={{
            width: 340,
            padding: 20,
            overflowY: "auto",
            background: "#fff",
            borderLeft: `3px solid ${colors.creamDeep}`,
          }}
        >
          <div className="map-aside-handle" />
          <button type="button" className="map-aside-close" onClick={closeDetail} aria-label="닫기">
            ✕
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <h2 style={{ marginBottom: 4 }}>{selected.name}</h2>
            {selected.visited_by_me && user && <VisitStamp nickname={user.nickname} />}
          </div>
          {selected.rating_count ? (
            <p style={{ margin: "0 0 10px", fontSize: 14, color: colors.brown }}>
              <StarDisplay rating={selected.average_rating ?? 0} /> {selected.average_rating?.toFixed(1)}{" "}
              <span style={{ color: colors.textMuted }}>({selected.rating_count}명)</span>
            </p>
          ) : (
            <p style={{ margin: "0 0 10px", fontSize: 13, color: colors.textMuted }}>아직 별점 후기가 없어요.</p>
          )}
          {selected.images.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12 }}>
              {selected.images.map((img) => (
                <img
                  key={img.id}
                  src={`${apiBase}${img.image_url}`}
                  alt={selected.name}
                  style={{
                    width: 120,
                    height: 90,
                    objectFit: "cover",
                    borderRadius: radius.sm,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {selected.type && <Tag color={colors.green}>{PLAYGROUND_TYPE_LABEL[selected.type]}</Tag>}
            {selected.age_groups?.map((ag) => (
              <Tag key={ag} color={colors.blue}>
                {AGE_GROUP_LABEL[ag]}
              </Tag>
            ))}
          </div>

          <p style={{ color: colors.text }}>{selected.address}</p>
          {myLocation && (
            <p style={{ color: colors.textMuted, fontSize: 13 }}>
              📍 현재 위치에서{" "}
              {formatDistance(
                distanceMeters(myLocation, { lat: selected.latitude, lng: selected.longitude }),
              )}
            </p>
          )}
          {selected.directions && <p style={{ color: colors.textMuted }}>{selected.directions}</p>}
          {selected.description && <p>{selected.description}</p>}
          {selected.operating_hours && <p>영업시간: {selected.operating_hours}</p>}
          {selected.closed_days && <p>휴무일: {selected.closed_days}</p>}
          {selected.operating_season && <p>운영기간: {selected.operating_season}</p>}
          {selected.phone && <p>전화: {selected.phone}</p>}

          <p style={{ fontSize: 12, color: colors.textMuted, margin: "4px 0" }}>
            👀 조회 {selected.view_count} · 🔖 저장 {selected.save_count ?? 0}
          </p>
          {selected.active_viewers > 0 && (
            <p
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "#fff",
                background: colors.pink,
                borderRadius: radius.pill,
                padding: "3px 10px",
                margin: "0 0 4px",
              }}
            >
              🔥 지금 {selected.active_viewers}명이 보는 중
            </p>
          )}

          {(selected.condition_status || selected.size || selected.play_duration || selected.recommended_age || selected.recommend_rating) && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: 14 }}>관리 상태 · 추천</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {selected.condition_status && <Tag color={colors.green}>{CONDITION_STATUS_LABEL[selected.condition_status]}</Tag>}
                {selected.size && <Tag color={colors.blue}>{PLAYGROUND_SIZE_LABEL[selected.size]}</Tag>}
                {selected.play_duration && <Tag color={colors.yellow}>예상 {PLAY_DURATION_LABEL[selected.play_duration]}</Tag>}
                {selected.recommended_age != null && <Tag color={colors.pink}>추천 나이 {selected.recommended_age}세</Tag>}
                {selected.recommend_rating != null && (
                  <span style={{ fontSize: 13 }}>
                    <StarDisplay rating={selected.recommend_rating} />
                  </span>
                )}
              </div>
            </div>
          )}

          {hasExtraDetails(selected) && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: 14 }}>상세 정보</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.nature_features?.map((f) => (
                  <Tag key={f} color={colors.green}>{NATURE_FEATURE_LABEL[f]}</Tag>
                ))}
                {selected.pet_policy && <Tag color={colors.blue}>{PET_POLICY_LABEL[selected.pet_policy]}</Tag>}
                {selected.nearby_facilities?.map((f) => (
                  <Tag key={f} color={colors.yellow}>{NEARBY_FACILITY_LABEL[f]}</Tag>
                ))}
                {selected.smoking_status && <Tag color={colors.pink}>{SMOKING_STATUS_LABEL[selected.smoking_status]}</Tag>}
                {selected.wheeled_access?.map((w) => (
                  <Tag key={w} color={colors.brown}>{WHEELED_ACCESS_LABEL[w]}</Tag>
                ))}
                {selected.stroller_access_level && (
                  <Tag color={colors.blue}>유모차 접근 {ACCESS_LEVEL_LABEL[selected.stroller_access_level]}</Tag>
                )}
                {selected.road_safety && <Tag color={colors.pink}>도로 인접 {ROAD_SAFETY_LABEL[selected.road_safety]}</Tag>}
              </div>
            </div>
          )}

          {selected.mood_tags && selected.mood_tags.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: 14 }}>분위기</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.mood_tags.map((tag) => (
                  <Tag key={tag} color={colors.green}>{MOOD_TAG_LABEL[tag]}</Tag>
                ))}
              </div>
            </div>
          )}

          {hasSafetyInfo(selected) && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: 14 }}>안전 정보</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.surface_types?.map((s) => (
                  <Tag key={s} color={colors.yellow}>{SURFACE_TYPE_LABEL[s]}</Tag>
                ))}
                {selected.shade_level && <Tag color={colors.green}>그늘 {SHADE_LEVEL_LABEL[selected.shade_level]}</Tag>}
                {selected.restroom && selected.restroom !== "none" && (
                  <Tag color={colors.blue}>화장실 {RESTROOM_LABEL[selected.restroom]}</Tag>
                )}
                {selected.parking && selected.parking !== "none" && (
                  <Tag color={colors.blue}>주차 {PARKING_LABEL[selected.parking]}</Tag>
                )}
                {selected.fence && selected.fence !== "none" && (
                  <Tag color={colors.pink}>펜스 {FENCE_LABEL[selected.fence]}</Tag>
                )}
                {selected.has_water_fountain && <Tag color={colors.blue}>음수대</Tag>}
                {selected.has_cctv && <Tag color={colors.blue}>CCTV</Tag>}
                {selected.stroller_accessible && <Tag color={colors.green}>유모차 가능</Tag>}
                {selected.wheelchair_accessible && <Tag color={colors.green}>휠체어 가능</Tag>}
              </div>
            </div>
          )}

          {selected.equipment && selected.equipment.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: 14 }}>놀이기구</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.equipment.map((eq) => (
                  <Tag key={eq} color={colors.brown}>{EQUIPMENT_LABEL[eq]}</Tag>
                ))}
              </div>
            </div>
          )}

          {selected.sports_facilities && selected.sports_facilities.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: 14 }}>부가 시설</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.sports_facilities.map((f) => (
                  <Tag key={f} color={colors.blue}>{SPORTS_FACILITY_LABEL[f]}</Tag>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={toggleLike}
              disabled={!user}
              style={{
                border: "none",
                borderRadius: radius.pill,
                padding: "8px 16px",
                cursor: user ? "pointer" : "default",
                background: selected.liked_by_me ? colors.pink : colors.cream,
                color: selected.liked_by_me ? "#fff" : colors.brown,
                fontFamily: "'Jua', sans-serif",
              }}
            >
              ♥ 좋아요 {selected.like_count ?? 0}
            </button>

            <button
              type="button"
              onClick={toggleSave}
              disabled={!user}
              style={{
                border: "none",
                borderRadius: radius.pill,
                padding: "8px 16px",
                cursor: user ? "pointer" : "default",
                background: selected.saved_by_me ? colors.yellow : colors.cream,
                color: selected.saved_by_me ? "#fff" : colors.brown,
                fontFamily: "'Jua', sans-serif",
              }}
            >
              🔖 저장 {selected.save_count ?? 0}
            </button>

            {user && (
              <button
                type="button"
                onClick={checkIn}
                disabled={checkingIn || selected.visited_by_me}
                style={{
                  border: "none",
                  borderRadius: radius.pill,
                  padding: "8px 16px",
                  cursor: checkingIn || selected.visited_by_me ? "default" : "pointer",
                  background: selected.visited_by_me ? colors.green : colors.cream,
                  color: selected.visited_by_me ? "#fff" : colors.brown,
                  fontFamily: "'Jua', sans-serif",
                }}
              >
                {selected.visited_by_me
                  ? "👣 왔다감 완료"
                  : checkingIn
                    ? "위치 확인 중..."
                    : "👣 왔다감 체크"}
              </button>
            )}
          </div>
          {checkInError && (
            <p style={{ color: colors.pink, fontSize: 12, marginTop: -8, marginBottom: 12 }}>{checkInError}</p>
          )}

          <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
            {user && (
              <Link to={`/playgrounds/${selected.id}/edit`} style={{ fontSize: 13, color: colors.textMuted }}>
                ✏️ 정보 수정하기
              </Link>
            )}
            <Link to={`/playgrounds/${selected.id}/edits`} style={{ fontSize: 13, color: colors.textMuted }}>
              📜 수정 이력
            </Link>
          </div>

          <hr style={{ border: "none", borderTop: `2px solid ${colors.creamDeep}`, margin: "16px 0" }} />

          <h3 style={{ fontSize: 15 }}>댓글·후기 {selected.comment_count ?? comments.length}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
            {comments.map((c) => (
              <div key={c.id} style={{ background: colors.cream, borderRadius: radius.sm, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link to={`/feed?author=${c.author_id}`} style={{ textDecoration: "none" }}>
                    <strong style={{ fontSize: 13, color: colors.brown }}>{c.author_nickname}</strong>
                  </Link>
                  {user?.id === c.author_id && (
                    <button
                      type="button"
                      onClick={() => removeComment(c.id)}
                      style={{ border: "none", background: "transparent", color: colors.textMuted, cursor: "pointer", fontSize: 12 }}
                    >
                      삭제
                    </button>
                  )}
                </div>
                {c.rating && (
                  <p style={{ margin: "2px 0 0", fontSize: 13 }}>
                    <StarDisplay rating={c.rating} />
                  </p>
                )}
                <p style={{ margin: "4px 0 0", fontSize: 14 }}>{c.content}</p>
                {c.images.length > 0 && (
                  <div style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 6 }}>
                    {c.images.map((img) => (
                      <img
                        key={img.id}
                        src={`${apiBase}${img.image_url}`}
                        alt=""
                        style={{ width: 72, height: 72, objectFit: "cover", borderRadius: radius.sm, flexShrink: 0 }}
                      />
                    ))}
                  </div>
                )}
                {((c.recommended_ages && c.recommended_ages.length > 0) ||
                  (c.risk_tags && c.risk_tags.length > 0)) && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                    {c.recommended_ages?.map((ag) => (
                      <Tag key={ag} color={colors.blue}>
                        {AGE_GROUP_LABEL[ag]}
                      </Tag>
                    ))}
                    {c.risk_tags?.map((risk) => (
                      <Tag key={risk} color={colors.pink}>
                        ⚠ {RISK_TAG_LABEL[risk]}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {comments.length === 0 && (
              <p style={{ color: colors.textMuted, fontSize: 13 }}>아직 댓글이 없어요.</p>
            )}
          </div>

          {user ? (
            <form onSubmit={submitComment} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <StarPicker rating={commentRating} onChange={setCommentRating} />

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글이나 후기를 남겨보세요"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: radius.pill,
                    border: `2px solid ${colors.creamDeep}`,
                    fontSize: 13,
                  }}
                />
                <button type="submit" style={{ ...primaryButtonStyle(), padding: "8px 18px", fontSize: 13 }}>
                  등록
                </button>
              </div>

              <label style={{ fontSize: 12, color: colors.textMuted, cursor: "pointer" }}>
                📷 사진 추가{commentPhotos.length > 0 && ` (${commentPhotos.length}장 선택됨)`}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setCommentPhotos(Array.from(e.target.files ?? []))}
                  style={{ display: "none" }}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowReviewExtras((v) => !v)}
                style={{
                  alignSelf: "flex-start",
                  border: "none",
                  background: "transparent",
                  color: colors.textMuted,
                  fontSize: 12,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showReviewExtras ? "▲ 상세 정보 접기" : "▼ 연령 추천 · 주의사항 추가"}
              </button>

              {showReviewExtras && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, background: colors.cream, borderRadius: radius.sm, padding: 10 }}>
                  <div>
                    <p style={{ fontSize: 11, color: colors.textMuted, margin: "0 0 4px" }}>이 연령대에 추천해요</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {AGE_GROUPS.map((ag) => (
                        <label key={ag} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                          <input type="checkbox" checked={commentAges.includes(ag)} onChange={() => toggleCommentAge(ag)} />
                          {AGE_GROUP_LABEL[ag]}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: colors.textMuted, margin: "0 0 4px" }}>주의할 점이 있어요</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {RISK_TAGS.map((risk) => (
                        <label key={risk} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                          <input type="checkbox" checked={commentRisks.includes(risk)} onChange={() => toggleCommentRisk(risk)} />
                          {RISK_TAG_LABEL[risk]}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <p style={{ color: colors.textMuted, fontSize: 13 }}>댓글을 남기려면 로그인해주세요.</p>
          )}
        </aside>
      )}
    </div>
  );
}

function hasSafetyInfo(p: Playground): boolean {
  return Boolean(
    (p.surface_types && p.surface_types.length > 0) ||
      (p.shade_level && p.shade_level !== "none") ||
      (p.restroom && p.restroom !== "none") ||
      (p.parking && p.parking !== "none") ||
      (p.fence && p.fence !== "none") ||
      p.has_water_fountain ||
      p.has_cctv ||
      p.stroller_accessible ||
      p.wheelchair_accessible,
  );
}

function hasExtraDetails(p: Playground): boolean {
  return Boolean(
    (p.nature_features && p.nature_features.length > 0) ||
      p.pet_policy ||
      (p.nearby_facilities && p.nearby_facilities.length > 0) ||
      p.smoking_status ||
      (p.wheeled_access && p.wheeled_access.length > 0) ||
      p.stroller_access_level ||
      p.road_safety,
  );
}
