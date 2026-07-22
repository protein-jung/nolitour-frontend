import { apiClient } from "./client";
import type { Playground } from "../types/playground";

export interface AdminStats {
  total_playgrounds: number;
  pending_playgrounds: number;
  total_users: number;
  total_comments: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>("/admin/stats");
  return data;
}

export async function fetchAdminPlaygrounds(isVerified?: boolean): Promise<Playground[]> {
  const { data } = await apiClient.get<Playground[]>("/admin/playgrounds", {
    params: isVerified === undefined ? {} : { is_verified: isVerified },
  });
  return data;
}

export async function verifyPlaygroundAdmin(playgroundId: string): Promise<Playground> {
  const { data } = await apiClient.patch<Playground>(`/admin/playgrounds/${playgroundId}/verify`);
  return data;
}

export async function deletePlaygroundAdmin(playgroundId: string): Promise<void> {
  await apiClient.delete(`/admin/playgrounds/${playgroundId}`);
}
