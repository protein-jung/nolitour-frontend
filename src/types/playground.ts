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
  source: PlaygroundSource;
  is_verified: boolean;
  images: PlaygroundImage[];
}

export type PlaygroundCreate = Omit<
  Playground,
  "id" | "source" | "is_verified" | "images"
>;
