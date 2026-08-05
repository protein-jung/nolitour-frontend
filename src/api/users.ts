import { apiClient } from "./client";
import type { PublicUserProfile } from "../types/user";

export async function fetchUserProfile(userId: string): Promise<PublicUserProfile> {
  const { data } = await apiClient.get<PublicUserProfile>(`/users/${userId}`);
  return data;
}
