import { apiClient } from "./client";
import type { PlaygroundRankingItem, ReporterRankingItem } from "../types/ranking";

export async function fetchTopReporters(limit = 10): Promise<ReporterRankingItem[]> {
  const { data } = await apiClient.get<ReporterRankingItem[]>("/rankings/reporters", {
    params: { limit },
  });
  return data;
}

export async function fetchTopVisitors(limit = 10): Promise<ReporterRankingItem[]> {
  const { data } = await apiClient.get<ReporterRankingItem[]>("/rankings/visitors", {
    params: { limit },
  });
  return data;
}

export async function fetchTopPlaygrounds(limit = 10): Promise<PlaygroundRankingItem[]> {
  const { data } = await apiClient.get<PlaygroundRankingItem[]>("/rankings/playgrounds", {
    params: { limit },
  });
  return data;
}
