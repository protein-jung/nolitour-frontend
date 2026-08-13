import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPlayground, fetchPlaygroundEdits } from "../api/playgrounds";
import {
  ACCESS_LEVEL_LABEL,
  ADMISSION_FEE_TYPE_LABEL,
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
  type Playground,
  type PlaygroundEdit,
} from "../types/playground";
import { cardStyle, colors, radius } from "../styles/theme";

const FIELD_LABEL: Record<string, string> = {
  name: "이름",
  type: "유형",
  age_groups: "적합 연령",
  address: "주소",
  directions: "찾아가는 법",
  description: "소개",
  latitude: "위도",
  longitude: "경도",
  operating_hours: "영업시간",
  closed_days: "휴무일",
  phone: "전화번호",
  admission_fee_type: "이용료",
  admission_fee: "이용료 금액",
  surface_types: "바닥 재질",
  shade_level: "그늘",
  restroom: "화장실",
  parking: "주차",
  has_water_fountain: "음수대",
  has_cctv: "CCTV",
  fence: "펜스",
  stroller_accessible: "유모차 접근 가능",
  wheelchair_accessible: "휠체어 접근 가능",
  equipment: "놀이기구",
  condition_status: "관리 상태",
  size: "규모",
  play_duration: "예상 놀이시간",
  recommended_age: "가장 추천하는 나이",
  recommend_rating: "추천도",
  nature_features: "자연친화 특징",
  operating_season: "운영기간",
  pet_policy: "반려동물",
  nearby_facilities: "주변 시설",
  smoking_status: "흡연",
  wheeled_access: "자전거·킥보드",
  stroller_access_level: "유모차 접근성",
  road_safety: "도로 인접 안전도",
  mood_tags: "분위기 태그",
};

const ENUM_LABEL_MAPS: Record<string, Record<string, string>> = {
  type: PLAYGROUND_TYPE_LABEL,
  admission_fee_type: ADMISSION_FEE_TYPE_LABEL,
  age_groups: AGE_GROUP_LABEL,
  surface_types: SURFACE_TYPE_LABEL,
  shade_level: SHADE_LEVEL_LABEL,
  restroom: RESTROOM_LABEL,
  parking: PARKING_LABEL,
  fence: FENCE_LABEL,
  equipment: EQUIPMENT_LABEL,
  condition_status: CONDITION_STATUS_LABEL,
  size: PLAYGROUND_SIZE_LABEL,
  play_duration: PLAY_DURATION_LABEL,
  nature_features: NATURE_FEATURE_LABEL,
  pet_policy: PET_POLICY_LABEL,
  nearby_facilities: NEARBY_FACILITY_LABEL,
  smoking_status: SMOKING_STATUS_LABEL,
  wheeled_access: WHEELED_ACCESS_LABEL,
  stroller_access_level: ACCESS_LEVEL_LABEL,
  road_safety: ROAD_SAFETY_LABEL,
  mood_tags: MOOD_TAG_LABEL,
};

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined) return "(없음)";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  const enumMap = ENUM_LABEL_MAPS[field];
  if (Array.isArray(value)) {
    if (value.length === 0) return "(없음)";
    return value.map((v) => enumMap?.[String(v)] ?? String(v)).join(", ");
  }
  if (enumMap) return enumMap[String(value)] ?? String(value);
  return String(value);
}

export function EditHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [playground, setPlayground] = useState<Playground | null>(null);
  const [edits, setEdits] = useState<PlaygroundEdit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchPlayground(id), fetchPlaygroundEdits(id)])
      .then(([p, e]) => {
        setPlayground(p);
        setEdits(e);
      })
      .catch(() => setError("수정 이력을 불러오지 못했습니다."));
  }, [id]);

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        {id && (
          <Link to={`/playgrounds/${id}/edit`} style={{ fontSize: 13, color: colors.textMuted }}>
            ✏️ 정보 수정하러 가기
          </Link>
        )}

        {error && <p style={{ color: colors.pink }}>{error}</p>}
        {!edits && !error && <p style={{ color: colors.textMuted }}>불러오는 중...</p>}

        {playground && (
          <h1 style={{ marginBottom: 4 }}>{playground.name} 수정 이력</h1>
        )}
        {playground && (
          <p style={{ color: colors.textMuted, marginBottom: 28 }}>
            나무위키처럼 누구나 고칠 수 있어요. 여기서 누가 무엇을 바꿨는지 확인할 수 있습니다.
          </p>
        )}

        {edits && edits.length === 0 && (
          <p style={{ color: colors.textMuted }}>아직 수정 이력이 없어요.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {edits?.map((edit) => (
            <div key={edit.id} style={{ ...cardStyle(), padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 14, color: colors.brown }}>{edit.editor_nickname}</strong>
                <span style={{ fontSize: 12, color: colors.textMuted }}>
                  {new Date(edit.created_at).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {Object.entries(edit.changes).map(([field, change]) => (
                  <div key={field} style={{ fontSize: 13 }}>
                    <span
                      style={{
                        display: "inline-block",
                        minWidth: 90,
                        fontWeight: 600,
                        color: colors.brown,
                        marginRight: 6,
                      }}
                    >
                      {FIELD_LABEL[field] ?? field}
                    </span>
                    <span style={{ color: colors.textMuted }}>{formatValue(field, change.old)}</span>
                    <span style={{ margin: "0 6px" }}>→</span>
                    <span
                      style={{
                        background: colors.creamDeep,
                        borderRadius: radius.sm,
                        padding: "1px 8px",
                        color: colors.text,
                      }}
                    >
                      {formatValue(field, change.new)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
