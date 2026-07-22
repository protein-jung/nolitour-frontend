import { apiClient } from "./client";
import type { Playground } from "../types/playground";

export interface AdminStats {
  total_playgrounds: number;
  pending_playgrounds: number;
  total_users: number;
  total_comments: number;
}

export interface AdminUser {
  id: string;
  phone: string;
  name: string;
  nickname: string;
  is_admin: boolean;
  created_at: string;
  playground_count: number;
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

export async function unverifyPlaygroundAdmin(playgroundId: string): Promise<Playground> {
  const { data } = await apiClient.patch<Playground>(`/admin/playgrounds/${playgroundId}/unverify`);
  return data;
}

export async function deletePlaygroundAdmin(playgroundId: string): Promise<void> {
  await apiClient.delete(`/admin/playgrounds/${playgroundId}`);
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<AdminUser[]>("/admin/users");
  return data;
}

export async function setUserAdminRole(userId: string, isAdmin: boolean): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/admin/users/${userId}/admin`, {
    is_admin: isAdmin,
  });
  return data;
}
