export interface User {
  id: string;
  phone: string;
  name: string;
  nickname: string;
  is_admin: boolean;
}

export interface PublicUserProfile {
  id: string;
  nickname: string;
  playground_count: number;
  comment_count: number;
}
