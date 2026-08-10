import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { NaverMap, type LatLngLiteral, type NaverMapHandle } from "./NaverMap";
import { useNaverMapsScript } from "../hooks/useNaverMapsScript";
import { useKakaoMapsScript } from "../hooks/useKakaoMapsScript";
import { reverseGeocode } from "../lib/naverGeocoder";
import { searchPlaces } from "../lib/kakaoPlaces";
import { extractApiErrorMessage } from "../lib/apiError";
import type { AddressSuggestion } from "../types/address";
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
  ROAD_SAFETY_LABEL,
  SHADE_LEVEL_LABEL,
  SMOKING_STATUS_LABEL,
  SURFACE_TYPE_LABEL,
  WHEELED_ACCESS_LABEL,
  type AccessLevel,
  type AgeGroup,
  type ConditionStatus,
  type EquipmentType,
  type FenceType,
  type MoodTag,
  type NatureFeature,
  type NearbyFacility,
  type ParkingType,
  type PetPolicy,
  type PlayDuration,
  type Playground,
  type PlaygroundCreate,
  type PlaygroundSize,
  type PlaygroundType,
  type RestroomType,
  type RoadSafetyLevel,
  type ShadeLevel,
  type SmokingStatus,
  type SurfaceType,
  type WheeledAccessType,
} from "../types/playground";
import { cardStyle, colors, inputStyle, primaryButtonStyle, radius, secondaryButtonStyle, shadow } from "../styles/theme";
import { StarPicker } from "./Shared";

const PLAYGROUND_TYPES = Object.keys(PLAYGROUND_TYPE_LABEL) as PlaygroundType[];
const AGE_GROUPS = Object.keys(AGE_GROUP_LABEL) as AgeGroup[];
const SURFACE_TYPES = Object.keys(SURFACE_TYPE_LABEL) as SurfaceType[];
const SHADE_LEVELS = Object.keys(SHADE_LEVEL_LABEL) as ShadeLevel[];
const RESTROOM_TYPES = Object.keys(RESTROOM_LABEL) as RestroomType[];
const PARKING_TYPES = Object.keys(PARKING_LABEL) as ParkingType[];
const FENCE_TYPES = Object.keys(FENCE_LABEL) as FenceType[];
const EQUIPMENT_TYPES = Object.keys(EQUIPMENT_LABEL) as EquipmentType[];
const CONDITION_STATUSES = Object.keys(CONDITION_STATUS_LABEL) as ConditionStatus[];
const PLAYGROUND_SIZES = Object.keys(PLAYGROUND_SIZE_LABEL) as PlaygroundSize[];
const PLAY_DURATIONS = Object.keys(PLAY_DURATION_LABEL) as PlayDuration[];
const NATURE_FEATURES = Object.keys(NATURE_FEATURE_LABEL) as NatureFeature[];
const PET_POLICIES = Object.keys(PET_POLICY_LABEL) as PetPolicy[];
const NEARBY_FACILITIES = Object.keys(NEARBY_FACILITY_LABEL) as NearbyFacility[];
const SMOKING_STATUSES = Object.keys(SMOKING_STATUS_LABEL) as SmokingStatus[];
const WHEELED_ACCESS_TYPES = Object.keys(WHEELED_ACCESS_LABEL) as WheeledAccessType[];
const ACCESS_LEVELS = Object.keys(ACCESS_LEVEL_LABEL) as AccessLevel[];
const ROAD_SAFETY_LEVELS = Object.keys(ROAD_SAFETY_LABEL) as RoadSafetyLevel[];
const MOOD_TAGS = Object.keys(MOOD_TAG_LABEL) as MoodTag[];

const SEOUL_CENTER: LatLngLiteral = { lat: 37.5665, lng: 126.978 };
// 지도 축척 50m 정도로 확대되는 줌 레벨 (MapPage의 NEARBY_ZOOM과 동일)
const CURRENT_LOCATION_ZOOM = 17;

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14,
  color: colors.brown,
  fontWeight: 600,
};

interface PlaygroundFormProps {
  /** 지정하면 수정 모드로 동작하며 기존 값으로 폼을 채운다 */
  initial?: Playground;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (payload: PlaygroundCreate, photos: File[]) => Promise<void>;
}

export function PlaygroundForm({ initial, submitLabel, submittingLabel, onSubmit }: PlaygroundFormProps) {
  const naverMapsLoaded = useNaverMapsScript(import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? "");
  useKakaoMapsScript(import.meta.env.VITE_KAKAO_JS_KEY ?? "");

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<PlaygroundType | "">(initial?.type ?? "");
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>(initial?.age_groups ?? []);
  const [address, setAddress] = useState(initial?.address ?? "");
  const [addressDetail, setAddressDetail] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const searchDebounceRef = useRef<number | null>(null);
  const mapHandleRef = useRef<NaverMapHandle>(null);
  const [directions, setDirections] = useState(initial?.directions ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [operatingHours, setOperatingHours] = useState(initial?.operating_hours ?? "");
  const [closedDays, setClosedDays] = useState(initial?.closed_days ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [surfaceTypes, setSurfaceTypes] = useState<SurfaceType[]>(initial?.surface_types ?? []);
  const [shadeLevel, setShadeLevel] = useState<ShadeLevel | "">(initial?.shade_level ?? "");
  const [restroom, setRestroom] = useState<RestroomType | "">(initial?.restroom ?? "");
  const [parking, setParking] = useState<ParkingType | "">(initial?.parking ?? "");
  const [hasWaterFountain, setHasWaterFountain] = useState(initial?.has_water_fountain ?? false);
  const [hasCctv, setHasCctv] = useState(initial?.has_cctv ?? false);
  const [fence, setFence] = useState<FenceType | "">(initial?.fence ?? "");
  const [strollerAccessible, setStrollerAccessible] = useState(initial?.stroller_accessible ?? false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(initial?.wheelchair_accessible ?? false);
  const [equipment, setEquipment] = useState<EquipmentType[]>(initial?.equipment ?? []);

  const [conditionStatus, setConditionStatus] = useState<ConditionStatus | "">(initial?.condition_status ?? "");
  const [size, setSize] = useState<PlaygroundSize | "">(initial?.size ?? "");
  const [playDuration, setPlayDuration] = useState<PlayDuration | "">(initial?.play_duration ?? "");
  const [recommendedAge, setRecommendedAge] = useState(
    initial?.recommended_age != null ? String(initial.recommended_age) : "",
  );
  const [recommendRating, setRecommendRating] = useState(initial?.recommend_rating ?? 0);

  const [natureFeatures, setNatureFeatures] = useState<NatureFeature[]>(initial?.nature_features ?? []);
  const [operatingSeason, setOperatingSeason] = useState(initial?.operating_season ?? "");
  const [petPolicy, setPetPolicy] = useState<PetPolicy | "">(initial?.pet_policy ?? "");

  const [nearbyFacilities, setNearbyFacilities] = useState<NearbyFacility[]>(initial?.nearby_facilities ?? []);
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus | "">(initial?.smoking_status ?? "");
  const [wheeledAccess, setWheeledAccess] = useState<WheeledAccessType[]>(initial?.wheeled_access ?? []);
  const [strollerAccessLevel, setStrollerAccessLevel] = useState<AccessLevel | "">(
    initial?.stroller_access_level ?? "",
  );
  const [roadSafety, setRoadSafety] = useState<RoadSafetyLevel | "">(initial?.road_safety ?? "");

  const [moodTags, setMoodTags] = useState<MoodTag[]>(initial?.mood_tags ?? []);

  const [position, setPosition] = useState<LatLngLiteral | null>(
    initial ? { lat: initial.latitude, lng: initial.longitude } : null,
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleAgeGroup(ag: AgeGroup) {
    setAgeGroups((prev) => (prev.includes(ag) ? prev.filter((v) => v !== ag) : [...prev, ag]));
  }

  function toggleSurfaceType(s: SurfaceType) {
    setSurfaceTypes((prev) => (prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]));
  }

  function toggleEquipment(eq: EquipmentType) {
    setEquipment((prev) => (prev.includes(eq) ? prev.filter((v) => v !== eq) : [...prev, eq]));
  }

  function toggleInArray<T>(setter: (updater: (prev: T[]) => T[]) => void, value: T) {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
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
        mapHandleRef.current?.zoomTo(coords, CURRENT_LOCATION_ZOOM);
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
      await onSubmit(
        {
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
          condition_status: conditionStatus || null,
          size: size || null,
          play_duration: playDuration || null,
          recommended_age: recommendedAge ? Number(recommendedAge) : null,
          recommend_rating: recommendRating > 0 ? recommendRating : null,
          nature_features: natureFeatures.length ? natureFeatures : null,
          operating_season: operatingSeason || null,
          pet_policy: petPolicy || null,
          nearby_facilities: nearbyFacilities.length ? nearbyFacilities : null,
          smoking_status: smokingStatus || null,
          wheeled_access: wheeledAccess.length ? wheeledAccess : null,
          stroller_access_level: strollerAccessLevel || null,
          road_safety: roadSafety || null,
          mood_tags: moodTags.length ? moodTags : null,
        },
        photos,
      );
    } catch (e) {
      setError(extractApiErrorMessage(e, "저장에 실패했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
        <select style={inputStyle()} value={type} onChange={(e) => setType(e.target.value as PlaygroundType)}>
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
              <input type="checkbox" checked={ageGroups.includes(ag)} onChange={() => toggleAgeGroup(ag)} />
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
                    borderBottom: i < addressSuggestions.length - 1 ? `1px solid ${colors.creamDeep}` : "none",
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
            ref={mapHandleRef}
            playgrounds={[]}
            onMapClick={handleMapPositionChange}
            pinPosition={position}
            initialCenter={position ?? SEOUL_CENTER}
            initialZoom={position ? 16 : 11}
          />
        </div>
      </div>

      <label style={labelStyle}>
        상세주소 (동/호수 등)
        <input style={inputStyle()} value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} />
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
        <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>안전 정보 (선택)</legend>
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
        <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>놀이기구 (복수 선택 가능)</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {EQUIPMENT_TYPES.map((eq) => (
            <label key={eq} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
              <input type="checkbox" checked={equipment.includes(eq)} onChange={() => toggleEquipment(eq)} />
              {EQUIPMENT_LABEL[eq]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ border: `2px solid ${colors.creamDeep}`, borderRadius: radius.md, padding: 14 }}>
        <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>
          관리 상태 · 규모 · 놀이시간 (선택)
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
            관리 상태
            <select
              style={inputStyle()}
              value={conditionStatus}
              onChange={(e) => setConditionStatus(e.target.value as ConditionStatus)}
            >
              <option value="">선택 안함</option>
              {CONDITION_STATUSES.map((v) => (
                <option key={v} value={v}>{CONDITION_STATUS_LABEL[v]}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
            규모
            <select style={inputStyle()} value={size} onChange={(e) => setSize(e.target.value as PlaygroundSize)}>
              <option value="">선택 안함</option>
              {PLAYGROUND_SIZES.map((v) => (
                <option key={v} value={v}>{PLAYGROUND_SIZE_LABEL[v]}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
            예상 놀이시간
            <select
              style={inputStyle()}
              value={playDuration}
              onChange={(e) => setPlayDuration(e.target.value as PlayDuration)}
            >
              <option value="">선택 안함</option>
              {PLAY_DURATIONS.map((v) => (
                <option key={v} value={v}>{PLAY_DURATION_LABEL[v]}</option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset style={{ border: `2px solid ${colors.creamDeep}`, borderRadius: radius.md, padding: 14 }}>
        <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>추천 (선택)</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
            가장 추천하는 나이 (세)
            <input
              type="number"
              min={0}
              max={15}
              style={{ ...inputStyle(), width: 100 }}
              value={recommendedAge}
              onChange={(e) => setRecommendedAge(e.target.value)}
            />
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, color: colors.textMuted }}>부모에게 추천하시나요?</span>
            <StarPicker rating={recommendRating} onChange={setRecommendRating} />
          </div>
        </div>
      </fieldset>

      <fieldset style={{ border: `2px solid ${colors.creamDeep}`, borderRadius: radius.md, padding: 14 }}>
        <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>
          자연친화 · 반려동물 · 운영기간 (선택)
        </legend>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <p style={{ fontSize: 13, color: colors.textMuted, margin: "0 0 6px" }}>자연친화 (복수 선택)</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {NATURE_FEATURES.map((f) => (
                <label key={f} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={natureFeatures.includes(f)}
                    onChange={() => toggleInArray(setNatureFeatures, f)}
                  />
                  {NATURE_FEATURE_LABEL[f]}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
              반려동물
              <select style={inputStyle()} value={petPolicy} onChange={(e) => setPetPolicy(e.target.value as PetPolicy)}>
                <option value="">선택 안함</option>
                {PET_POLICIES.map((v) => (
                  <option key={v} value={v}>{PET_POLICY_LABEL[v]}</option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
              운영기간
              <input
                style={inputStyle()}
                value={operatingSeason}
                onChange={(e) => setOperatingSeason(e.target.value)}
                placeholder="예: 6월~8월"
              />
            </label>
          </div>
        </div>
      </fieldset>

      <fieldset style={{ border: `2px solid ${colors.creamDeep}`, borderRadius: radius.md, padding: 14 }}>
        <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>
          주변 시설 · 접근성 · 안전 (선택)
        </legend>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <p style={{ fontSize: 13, color: colors.textMuted, margin: "0 0 6px" }}>주변 시설 (복수 선택)</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {NEARBY_FACILITIES.map((f) => (
                <label key={f} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={nearbyFacilities.includes(f)}
                    onChange={() => toggleInArray(setNearbyFacilities, f)}
                  />
                  {NEARBY_FACILITY_LABEL[f]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 13, color: colors.textMuted, margin: "0 0 6px" }}>자전거·킥보드 (복수 선택)</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {WHEELED_ACCESS_TYPES.map((w) => (
                <label key={w} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={wheeledAccess.includes(w)}
                    onChange={() => toggleInArray(setWheeledAccess, w)}
                  />
                  {WHEELED_ACCESS_LABEL[w]}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
              흡연
              <select
                style={inputStyle()}
                value={smokingStatus}
                onChange={(e) => setSmokingStatus(e.target.value as SmokingStatus)}
              >
                <option value="">선택 안함</option>
                {SMOKING_STATUSES.map((v) => (
                  <option key={v} value={v}>{SMOKING_STATUS_LABEL[v]}</option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
              유모차 접근성
              <select
                style={inputStyle()}
                value={strollerAccessLevel}
                onChange={(e) => setStrollerAccessLevel(e.target.value as AccessLevel)}
              >
                <option value="">선택 안함</option>
                {ACCESS_LEVELS.map((v) => (
                  <option key={v} value={v}>{ACCESS_LEVEL_LABEL[v]}</option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: colors.textMuted }}>
              도로와 가까움
              <select
                style={inputStyle()}
                value={roadSafety}
                onChange={(e) => setRoadSafety(e.target.value as RoadSafetyLevel)}
              >
                <option value="">선택 안함</option>
                {ROAD_SAFETY_LEVELS.map((v) => (
                  <option key={v} value={v}>{ROAD_SAFETY_LABEL[v]}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </fieldset>

      <fieldset style={{ border: `2px solid ${colors.creamDeep}`, borderRadius: radius.md, padding: 14 }}>
        <legend style={{ padding: "0 6px", color: colors.brown, fontWeight: 600 }}>
          놀이터 분위기 태그 (복수 선택 가능)
        </legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {MOOD_TAGS.map((tag) => (
            <label key={tag} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
              <input type="checkbox" checked={moodTags.includes(tag)} onChange={() => toggleInArray(setMoodTags, tag)} />
              {MOOD_TAG_LABEL[tag]}
            </label>
          ))}
        </div>
      </fieldset>

      <label style={labelStyle}>
        사진 추가 (선택, 여러 장 가능)
        <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} />
      </label>

      {error && <p style={{ color: colors.pink }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        style={{ ...primaryButtonStyle(submitting), width: "100%", textAlign: "center" }}
      >
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
