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
  source: PlaygroundSource;
  is_verified: boolean;
  images: PlaygroundImage[];
  // 목록 조회 시에는 null, 단건 조회 시에만 채워짐
  like_count: number | null;
  liked_by_me: boolean | null;
  comment_count: number | null;
  average_rating: number | null;
  rating_count: number | null;
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
>;

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
}
