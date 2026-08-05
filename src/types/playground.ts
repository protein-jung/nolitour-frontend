// 백엔드 app/models/playground.py의 enum과 동일하게 유지할 것

export type PlaygroundType =
  | "apartment" // 아파트 단지 내
  | "neighborhood_park" // 근린공원 내
  | "childrens_park" // 어린이공원 내
  | "school" // 학교 부속
  | "indoor" // 실내 놀이터
  | "theme" // 특수 테마 놀이터
  | "inclusive" // 무장애·통합 놀이터
  | "riverside" // 하천·수변 공원 내
  | "etc";

export const PLAYGROUND_TYPE_LABEL: Record<PlaygroundType, string> = {
  apartment: "아파트 단지형",
  neighborhood_park: "근린공원형",
  childrens_park: "어린이공원형",
  school: "학교부속형",
  indoor: "실내 놀이터",
  theme: "테마 놀이터",
  inclusive: "무장애·통합 놀이터",
  riverside: "하천·수변공원형",
  etc: "기타",
};

export type AgeGroup = "infant" | "toddler" | "child" | "preteen" | "all_ages";

export const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  infant: "영유아 (0~3세)",
  toddler: "유아 (4~6세)",
  child: "어린이 (7~9세)",
  preteen: "초등고학년 (10~12세)",
  all_ages: "전연령",
};

export type PlaygroundSource = "public_data" | "user_submitted";

export interface PlaygroundImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

// 안전 정보
export type SurfaceType = "urethane" | "sand" | "grass" | "rubber_chip" | "soil";

export const SURFACE_TYPE_LABEL: Record<SurfaceType, string> = {
  urethane: "우레탄",
  sand: "모래",
  grass: "잔디",
  rubber_chip: "고무칩",
  soil: "흙",
};

export type ShadeLevel = "sufficient" | "moderate" | "none";

export const SHADE_LEVEL_LABEL: Record<ShadeLevel, string> = {
  sufficient: "충분함",
  moderate: "보통",
  none: "없음",
};

export type RestroomType = "none" | "available" | "available_with_diaper_table";

export const RESTROOM_LABEL: Record<RestroomType, string> = {
  none: "없음",
  available: "있음",
  available_with_diaper_table: "기저귀 교환대 있음",
};

export type ParkingType = "none" | "free" | "paid";

export const PARKING_LABEL: Record<ParkingType, string> = {
  none: "없음",
  free: "무료",
  paid: "유료",
};

export type FenceType = "full" | "partial" | "none";

export const FENCE_LABEL: Record<FenceType, string> = {
  full: "완전 둘러짐",
  partial: "부분 있음",
  none: "없음",
};

// 놀이기구
export type EquipmentType =
  | "slide"
  | "swing"
  | "seesaw"
  | "zipline"
  | "sand_play"
  | "trampoline"
  | "climbing"
  | "water_play";

export const EQUIPMENT_LABEL: Record<EquipmentType, string> = {
  slide: "미끄럼틀",
  swing: "그네",
  seesaw: "시소",
  zipline: "집라인",
  sand_play: "모래놀이",
  trampoline: "트램펄린",
  climbing: "클라이밍",
  water_play: "물놀이",
};

// 관리 상태
export type ConditionStatus = "very_clean" | "average" | "needs_care";

export const CONDITION_STATUS_LABEL: Record<ConditionStatus, string> = {
  very_clean: "매우 깨끗함",
  average: "보통",
  needs_care: "관리 필요",
};

// 규모
export type PlaygroundSize = "small" | "medium" | "large";

export const PLAYGROUND_SIZE_LABEL: Record<PlaygroundSize, string> = {
  small: "소형",
  medium: "중형",
  large: "대형",
};

// 예상 놀이시간
export type PlayDuration = "min_30" | "hour_1" | "hour_2_plus";

export const PLAY_DURATION_LABEL: Record<PlayDuration, string> = {
  min_30: "30분",
  hour_1: "1시간",
  hour_2_plus: "2시간 이상",
};

// 자연친화 특징
export type NatureFeature = "many_trees" | "shady" | "in_forest" | "in_park";

export const NATURE_FEATURE_LABEL: Record<NatureFeature, string> = {
  many_trees: "나무 많음",
  shady: "그늘 많음",
  in_forest: "숲 속",
  in_park: "공원 안",
};

// 반려동물 출입
export type PetPolicy = "allowed" | "not_allowed";

export const PET_POLICY_LABEL: Record<PetPolicy, string> = {
  allowed: "반려견 출입 가능",
  not_allowed: "반려동물 출입 불가",
};

// 주변 시설
export type NearbyFacility = "convenience_store" | "cafe" | "restroom" | "pharmacy" | "hospital" | "parking";

export const NEARBY_FACILITY_LABEL: Record<NearbyFacility, string> = {
  convenience_store: "편의점",
  cafe: "카페",
  restroom: "화장실",
  pharmacy: "약국",
  hospital: "병원",
  parking: "주차장",
};

// 흡연 관련
export type SmokingStatus = "many_smokers" | "no_smoking_zone";

export const SMOKING_STATUS_LABEL: Record<SmokingStatus, string> = {
  many_smokers: "흡연자 많음",
  no_smoking_zone: "금연구역",
};

// 자전거·킥보드
export type WheeledAccessType = "kickboard" | "bicycle";

export const WHEELED_ACCESS_LABEL: Record<WheeledAccessType, string> = {
  kickboard: "킥보드 가능",
  bicycle: "자전거 가능",
};

// 접근성 등급 (유모차 등)
export type AccessLevel = "easy" | "moderate" | "difficult";

export const ACCESS_LEVEL_LABEL: Record<AccessLevel, string> = {
  easy: "쉬움",
  moderate: "보통",
  difficult: "어려움",
};

// 도로 인접 안전도
export type RoadSafetyLevel = "very_safe" | "moderate" | "dangerous";

export const ROAD_SAFETY_LABEL: Record<RoadSafetyLevel, string> = {
  very_safe: "매우 안전",
  moderate: "보통",
  dangerous: "위험",
};

// 놀이터 분위기 태그
export type MoodTag =
  | "quiet"
  | "active"
  | "photogenic"
  | "spacious"
  | "newly_built"
  | "well_maintained"
  | "hidden_gem"
  | "rainy_day_ok"
  | "summer_pick"
  | "winter_pick"
  | "stroller_friendly"
  | "first_playground"
  | "date_spot"
  | "forest_vibe"
  | "lots_to_do";

export const MOOD_TAG_LABEL: Record<MoodTag, string> = {
  quiet: "조용한",
  active: "활동적인",
  photogenic: "사진 찍기 좋은",
  spacious: "넓은",
  newly_built: "신설",
  well_maintained: "관리 잘됨",
  hidden_gem: "숨은 명소",
  rainy_day_ok: "비 오는 날도 가능",
  summer_pick: "여름 추천",
  winter_pick: "겨울 추천",
  stroller_friendly: "유모차 추천",
  first_playground: "첫 놀이터",
  date_spot: "데이트 가능",
  forest_vibe: "숲속",
  lots_to_do: "놀거리 많음",
};

export interface Playground {
  id: string;
  name: string;
  type: PlaygroundType | null;
  age_groups: AgeGroup[] | null;
  address: string;
  directions: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  operating_hours: string | null;
  closed_days: string | null;
  phone: string | null;
  surface_types: SurfaceType[] | null;
  shade_level: ShadeLevel | null;
  restroom: RestroomType | null;
  parking: ParkingType | null;
  has_water_fountain: boolean | null;
  has_cctv: boolean | null;
  fence: FenceType | null;
  stroller_accessible: boolean | null;
  wheelchair_accessible: boolean | null;
  equipment: EquipmentType[] | null;

  // 관리 상태 · 규모 · 놀이시간 · 추천
  condition_status: ConditionStatus | null;
  size: PlaygroundSize | null;
  play_duration: PlayDuration | null;
  recommended_age: number | null;
  recommend_rating: number | null;

  // 자연·반려동물·운영기간
  nature_features: NatureFeature[] | null;
  operating_season: string | null;
  pet_policy: PetPolicy | null;

  // 주변 시설 · 흡연 · 이동수단 · 접근성 · 안전
  nearby_facilities: NearbyFacility[] | null;
  smoking_status: SmokingStatus | null;
  wheeled_access: WheeledAccessType[] | null;
  stroller_access_level: AccessLevel | null;
  road_safety: RoadSafetyLevel | null;

  // 분위기 태그
  mood_tags: MoodTag[] | null;

  source: PlaygroundSource;
  is_verified: boolean;
  images: PlaygroundImage[];
  // 목록 조회 시에는 null, 단건 조회 시에만 채워짐
  like_count: number | null;
  liked_by_me: boolean | null;
  comment_count: number | null;
  average_rating: number | null;
  rating_count: number | null;
  // 로그인한 사용자가 후기를 남긴 적 있는지 (목록·단건 조회 모두 채워짐, 퀘스트 완료 마커 표시용)
  reviewed_by_me: boolean;
  // 로그인한 사용자가 GPS로 '왔다감' 체크인한 적 있는지 (목록·단건 조회 모두 채워짐)
  visited_by_me: boolean;

  // 운영 중 자동으로 쌓이는 데이터 (제보자가 입력하지 않음)
  view_count: number;
  save_count: number | null;
  saved_by_me: boolean | null;
}

export type PlaygroundCreate = Omit<
  Playground,
  | "id"
  | "source"
  | "is_verified"
  | "images"
  | "like_count"
  | "liked_by_me"
  | "comment_count"
  | "average_rating"
  | "rating_count"
  | "reviewed_by_me"
  | "visited_by_me"
  | "view_count"
  | "save_count"
  | "saved_by_me"
>;

export interface VisitResult {
  visited_by_me: boolean;
  distance_m: number;
}

export interface FieldChange {
  old: unknown;
  new: unknown;
}

export interface PlaygroundEdit {
  id: string;
  editor_id: string;
  editor_nickname: string;
  changes: Record<string, FieldChange>;
  created_at: string;
}

// 후기 위험도 태그 (부모 제보)
export type RiskTag = "near_road" | "many_bugs" | "poorly_maintained";

export const RISK_TAG_LABEL: Record<RiskTag, string> = {
  near_road: "도로 인접",
  many_bugs: "벌레 많음",
  poorly_maintained: "관리 부족",
};

export interface CommentImage {
  id: string;
  image_url: string;
}

export interface PlaygroundComment {
  id: string;
  content: string;
  rating: number | null;
  recommended_ages: AgeGroup[] | null;
  risk_tags: RiskTag[] | null;
  created_at: string;
  author_nickname: string;
  author_id: string;
  images: CommentImage[];
}

export interface LikeStatus {
  like_count: number;
  liked_by_me: boolean;
}

export interface SaveStatus {
  save_count: number;
  saved_by_me: boolean;
}

export interface FeedItem {
  id: string;
  content: string;
  rating: number | null;
  recommended_ages: AgeGroup[] | null;
  risk_tags: RiskTag[] | null;
  created_at: string;
  author_nickname: string;
  author_id: string;
  images: CommentImage[];
  playground_id: string;
  playground_name: string;
  playground_address: string;
  playground_latitude: number;
  playground_longitude: number;
  like_count: number;
  liked_by_me: boolean;
  reply_count: number;
}

export interface CommentReply {
  id: string;
  content: string;
  created_at: string;
  author_nickname: string;
  author_id: string;
}
