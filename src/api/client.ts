import axios from "axios";

const TOKEN_KEY = "nolitour_token";
const VIEWER_KEY = "nolitour_viewer_key";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// 비로그인 상태에서 "지금 보는 중" 인원수를 실제 방문자 단위로 집계할 수 있도록,
// 기기별로 하나의 익명 ID를 만들어 재사용한다. (로그인 사용자와 달리 서버가 구분할 방법이 없어서 필요)
function getViewerKey(): string {
  let key = localStorage.getItem(VIEWER_KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(VIEWER_KEY, key);
  }
  return key;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  config.headers.set("X-Viewer-Key", getViewerKey());
  return config;
});
