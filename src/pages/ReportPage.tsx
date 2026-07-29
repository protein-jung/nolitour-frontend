import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NaverMap, type LatLngLiteral } from "../components/NaverMap";
import { createPlayground, uploadPlaygroundImage } from "../api/playgrounds";
import { useNaverMapsScript } from "../hooks/useNaverMapsScript";
import { useKakaoMapsScript } from "../hooks/useKakaoMapsScript";
import { reverseGeocode } from "../lib/naverGeocoder";
import { searchPlaces } from "../lib/kakaoPlaces";
import type { AddressSuggestion } from "../types/address";
import {
  AGE_GROUP_LABEL,
  EQUIPMENT_LABEL,
  FENCE_LABEL,
  PARKING_LABEL,
  PLAYGROUND_TYPE_LABEL,
  RESTROOM_LABEL,
  SHADE_LEVEL_LABEL,
  SURFACE_TYPE_LABEL,
  type AgeGroup,
  type EquipmentType,
  type FenceType,
  type ParkingType,
  type PlaygroundType,
  type RestroomType,
  type ShadeLevel,
  type SurfaceType,
} from "../types/playground";
import { cardStyle, colors, inputStyle, primaryButtonStyle, radius, secondaryButtonStyle, shadow } from "../styles/theme";

const PLAYGROUND_TYPES = Object.keys(PLAYGROUND_TYPE_LABEL) as PlaygroundType[];
const AGE_GROUPS = Object.keys(AGE_GROUP_LABEL) as AgeGroup[];
const SURFACE_TYPES = Object.keys(SURFACE_TYPE_LABEL) as SurfaceType[];
const SHADE_LEVELS = Object.keys(SHADE_LEVEL_LABEL) as ShadeLevel[];
const RESTROOM_TYPES = Object.keys(RESTROOM_LABEL) as RestroomType[];
const PARKING_TYPES = Object.keys(PARKING_LABEL) as ParkingType[];
const FENCE_TYPES = Object.keys(FENCE_LABEL) as FenceType[];
const EQUIPMENT_TYPES = Object.keys(EQUIPMENT_LABEL) as EquipmentType[];

const SEOUL_CENTER: LatLngLiteral = { lat: 37.5665, lng: 126.978 };

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14,
  color: colors.brown,
  fontWeight: 600,
};

export function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const naverMapsLoaded = useNaverMapsScript(import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? "");
  useKakaoMapsScript(import.meta.env.VITE_KAKAO_JS_KEY ?? "");

  const [name, setName] = useState("");
  const [type, setType] = useState<PlaygroundType | "">("");
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const searchDebounceRef = useRef<number | null>(null);
  const [directions, setDirections] = useState("");
  const [description, setDescription] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [closedDays, setClosedDays] = useState("");
  const [phone, setPhone] = useState("");
  const [surfaceTypes, setSurfaceTypes] = useState<SurfaceType[]>([]);
  const [shadeLevel, setShadeLevel] = useState<ShadeLevel | "">("");
  const [restroom, setRestroom] = useState<RestroomType | "">("");
  const [parking, setParking] = useState<ParkingType | "">("");
  const [hasWaterFountain, setHasWaterFountain] = useState(false);
  const [hasCctv, setHasCctv] = useState(false);
  const [fence, setFence] = useState<FenceType | "">("");
  const [strollerAccessible, setStrollerAccessible] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "80px auto", padding: 32, textAlign: "center" }}>
          <p>놀이터 제보는 로그인 후 이용할 수 있습니다.</p>
          <button type="button" onClick={() => navigate("/login")} style={primaryButtonStyle()}>
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  function toggleAgeGroup(ag: AgeGroup) {
    setAgeGroups((prev) => (prev.includes(ag) ? prev.filter((v) => v !== ag) : [...prev, ag]));
  }

  function toggleSurfaceType(s: SurfaceType) {
    setSurfaceTypes((prev) => (prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]));
  }

  function toggleEquipment(eq: EquipmentType) {
    setEquipment((prev) => (prev.includes(eq) ? prev.filter((v) => v !== eq) : [...prev, eq]));
  }

  function handleAddressChange(value: string) {
    setAddress(value);
    setShowSuggestions(true);

    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    if (!value.trim()) {
      setAddressSuggestions([]);
      return;
    }
    searchDebounceRef.current = window.setTimeout(async () => {
      const results = await searchPlaces(value);
      setAddressSuggestions(results);
    }, 300);
  }

  function selectSuggestion(s: AddressSuggestion) {
    setAddress(s.roadAddress);
    setPosition({ lat: s.lat, lng: s.lng });
    setAddressSuggestions([]);
    setShowSuggestions(false);
  }

  async function handleMapPositionChange(pos: LatLngLiteral) {
    setPosition(pos);
    const addr = await reverseGeocode(pos);
    if (addr) setAddress(addr);
  }

  function useCurrentLocation() {
    setLocateError(null);
    if (!navigator.geolocation) {
      setLocateError("이 브라우저는 위치 확인을 지원하지 않습니다.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        const addr = await reverseGeocode(coords);
        if (addr) setAddress(addr);
        setLocating(false);
      },
      () => {
        setLocateError("현재 위치를 가져오지 못했습니다. 위치 권한을 확인해주세요.");
        setLocating(false);
      },
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError("놀이터 주소를 입력해주세요.");
      return;
    }
    if (!position) {
      setError("지도를 클릭해서 놀이터 위치를 지정해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const fullAddress = addressDetail ? `${address} ${addressDetail}` : address;
      const playground = await createPlayground({
        name,
        type: type || null,
        age_groups: ageGroups.length ? ageGroups : null,
        address: fullAddress,
        directions: directions || null,
        description: description || null,
        latitude: position.lat,
        longitude: position.lng,
        operating_hours: operatingHours || null,
        closed_days: closedDays || null,
        phone: phone || null,
        surface_types: surfaceTypes.length ? surfaceTypes : null,
        shade_level: shadeLevel || null,
        restroom: restroom || null,
        parking: parking || null,
        has_water_fountain: hasWaterFountain,
        has_cctv: hasCctv,
        fence: fence || null,
        stroller_accessible: strollerAccessible,
        wheelchair_accessible: wheelchairAccessible,
        equipment: equipment.length ? equipment : null,
      });

      for (const photo of photos) {
        await uploadPlaygroundImage(playground.id, photo);
      }

      navigate("/");
    } catch {
      setError("제보 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ textAlign: "center" }}>놀이터 제보하기</h1>
        <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: 28 }}>
          우리 동네 놀이터 정보를 알려주시면 다른 이용자들에게도 큰 도움이 됩니다 🙌
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ ...cardStyle(), padding: 28, display: "flex", flexDirection: "column", gap: 18 }}
        >
          <label style={labelStyle}>
            놀이터 이름 *
            <input style={inputStyle()} value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label style={labelStyle}>
            유형
            <select
              style={inputStyle()}
              value={type}
              onChange={(e) => setType(e.target.value as PlaygroundType)}
            >
              <option value="">선택 안함</option>
              {PLAYGROUND_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PLAYGROUND_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </label>

          <fieldset style={{ border: `2px solid ${colors.creamDeep}`, borderRadius: radius.md, padding: 14 }}>
            <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>
              적합 연령 (복수 선택 가능)
            </legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {AGE_GROUPS.map((ag) => (
                <label key={ag} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={ageGroups.includes(ag)}
                    onChange={() => toggleAgeGroup(ag)}
                  />
                  {AGE_GROUP_LABEL[ag]}
                </label>
              ))}
            </div>
          </fieldset>

          <div style={labelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>주소 *</span>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={!naverMapsLoaded || locating}
                style={{ ...secondaryButtonStyle(), padding: "6px 14px", fontSize: 13, whiteSpace: "nowrap" }}
              >
                📍 {locating ? "위치 확인 중..." : "현위치로"}
              </button>
            </div>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                style={{ ...inputStyle(), width: "100%", boxSizing: "border-box" }}
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="도로명 또는 지번 주소를 입력하세요"
                autoComplete="off"
                required
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: "#fff",
                    border: `2px solid ${colors.creamDeep}`,
                    borderRadius: radius.md,
                    boxShadow: shadow,
                    maxHeight: 240,
                    overflowY: "auto",
                    zIndex: 10,
                  }}
                >
                  {addressSuggestions.map((s, i) => (
                    <div
                      key={`${s.lat}-${s.lng}-${i}`}
                      onMouseDown={() => selectSuggestion(s)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        borderBottom:
                          i < addressSuggestions.length - 1 ? `1px solid ${colors.creamDeep}` : "none",
                      }}
                    >
                      <div style={{ fontSize: 14, color: colors.text }}>{s.roadAddress}</div>
                      <div style={{ fontSize: 12, color: colors.textMuted }}>{s.jibunAddress}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {locateError && <span style={{ color: colors.pink, fontSize: 12 }}>{locateError}</span>}

            <p style={{ fontSize: 12, color: colors.textMuted, margin: "6px 0 0" }}>
              주소를 선택하면 아래 지도에 마커가 표시돼요. 마커를 드래그하거나 지도를 클릭해서 정확한 위치로 조정할 수 있어요
              {position && ` (${position.lat.toFixed(6)}, ${position.lng.toFixed(6)})`}
            </p>
            <div style={{ height: 320, borderRadius: radius.md, overflow: "hidden", border: `2px solid ${colors.creamDeep}` }}>
              <NaverMap
                playgrounds={[]}
                onMapClick={handleMapPositionChange}
                pinPosition={position}
                initialCenter={SEOUL_CENTER}
                initialZoom={11}
              />
            </div>
          </div>

          <label style={labelStyle}>
            상세주소 (동/호수 등)
            <input
              style={inputStyle()}
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
            />
          </label>

          <label style={labelStyle}>
            찾아가는 법 (아파트 단지 내인 경우)
            <input style={inputStyle()} value={directions} onChange={(e) => setDirections(e.target.value)} />
          </label>

          <label style={labelStyle}>
            소개
            <textarea
              style={{ ...inputStyle(), resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>

          <label style={labelStyle}>
            영업시간 (선택)
            <input
              style={inputStyle()}
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="예: 24시간 개방"
            />
          </label>

          <label style={labelStyle}>
            휴무일 (선택)
            <input
              style={inputStyle()}
              value={closedDays}
              onChange={(e) => setClosedDays(e.target.value)}
              placeholder="예: 연중무휴"
            />
          </label>

          <label style={labelStyle}>
            전화번호 (선택)
            <input style={inputStyle()} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>

          <fieldset style={{ border: `2px solid ${colors.creamDeep}`, borderRadius: radius.md, padding: 14 }}>
            <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>
              안전 정보 (선택)
            </legend>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ fontSize: 13, color: colors.textMuted, margin: "0 0 6px" }}>바닥 재질 (복수 선택)</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {SURFACE_TYPES.map((s) => (
                    <label key={s} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                      <input type="checkbox" checked={surfaceTypes.includes(s)} onChange={() => toggleSurfaceType(s)} />
                      {SURFACE_TYPE_LABEL[s]}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
                  그늘
                  <select style={inputStyle()} value={shadeLevel} onChange={(e) => setShadeLevel(e.target.value as ShadeLevel)}>
                    <option value="">선택 안함</option>
                    {SHADE_LEVELS.map((v) => (
                      <option key={v} value={v}>{SHADE_LEVEL_LABEL[v]}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
                  화장실
                  <select style={inputStyle()} value={restroom} onChange={(e) => setRestroom(e.target.value as RestroomType)}>
                    <option value="">선택 안함</option>
                    {RESTROOM_TYPES.map((v) => (
                      <option key={v} value={v}>{RESTROOM_LABEL[v]}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
                  주차
                  <select style={inputStyle()} value={parking} onChange={(e) => setParking(e.target.value as ParkingType)}>
                    <option value="">선택 안함</option>
                    {PARKING_TYPES.map((v) => (
                      <option key={v} value={v}>{PARKING_LABEL[v]}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
                  펜스
                  <select style={inputStyle()} value={fence} onChange={(e) => setFence(e.target.value as FenceType)}>
                    <option value="">선택 안함</option>
                    {FENCE_TYPES.map((v) => (
                      <option key={v} value={v}>{FENCE_LABEL[v]}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input type="checkbox" checked={hasWaterFountain} onChange={(e) => setHasWaterFountain(e.target.checked)} />
                  음수대
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input type="checkbox" checked={hasCctv} onChange={(e) => setHasCctv(e.target.checked)} />
                  CCTV
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input type="checkbox" checked={strollerAccessible} onChange={(e) => setStrollerAccessible(e.target.checked)} />
                  유모차 접근 가능
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input type="checkbox" checked={wheelchairAccessible} onChange={(e) => setWheelchairAccessible(e.target.checked)} />
                  휠체어 접근 가능
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset style={{ border: `2px solid ${colors.creamDeep}`, borderRadius: radius.md, padding: 14 }}>
            <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>
              놀이기구 (복수 선택 가능)
            </legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {EQUIPMENT_TYPES.map((eq) => (
                <label key={eq} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input type="checkbox" checked={equipment.includes(eq)} onChange={() => toggleEquipment(eq)} />
                  {EQUIPMENT_LABEL[eq]}
                </label>
              ))}
            </div>
          </fieldset>

          <label style={labelStyle}>
            사진 (선택, 여러 장 가능)
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
            />
          </label>

          {error && <p style={{ color: colors.pink }}>{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            style={{ ...primaryButtonStyle(submitting), width: "100%", textAlign: "center" }}
          >
            {submitting ? "등록 중..." : "제보하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
