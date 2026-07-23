import { apiClient } from "./client";
import type { FeedItem } from "../types/playground";

export async function fetchFeed(limit = 20, offset = 0): Promise<FeedItem[]> {
  const { data } = await apiClient.get<FeedItem[]>("/feed", {
    params: { limit, offset },
  });
  return data;
}
