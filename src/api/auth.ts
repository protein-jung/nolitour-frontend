import { apiClient, clearToken, setToken } from "./client";
import type { User } from "../types/user";

export interface RegisterPayload {
  phone: string;
  password: string;
  name: string;
  nickname: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", payload);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await apiClient.post<{ access_token: string; token_type: string }>(
    "/auth/login",
    payload,
  );
  setToken(data.access_token);
  return fetchMe();
}

export function logout(): void {
  clearToken();
}
