export interface ReporterRankingItem {
  rank: number;
  user_id: string;
  nickname: string;
  count: number;
}

export interface PlaygroundRankingItem {
  rank: number;
  playground_id: string;
  name: string;
  address: string;
  score: number;
}
