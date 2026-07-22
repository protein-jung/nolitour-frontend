import { apiClient } from "./client";
import type { ReporterRankingItem } from "../types/ranking";

export async function fetchTopReporters(limit = 10): Promise<ReporterRankingItem[]> {
  const { data } = await apiClient.get<ReporterRankingItem[]>("/rankings/reporters", {
    params: { limit },
  });
  return data;
}
