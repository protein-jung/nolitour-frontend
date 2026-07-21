import { apiClient } from "./client";
import type { Playground, PlaygroundCreate, PlaygroundImage } from "../types/playground";

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export async function fetchPlaygrounds(bbox?: BoundingBox): Promise<Playground[]> {
  const { data } = await apiClient.get<Playground[]>("/playgrounds", {
    params: bbox && {
      min_lat: bbox.minLat,
      max_lat: bbox.maxLat,
      min_lng: bbox.minLng,
      max_lng: bbox.maxLng,
    },
  });
  return data;
}

export async function fetchPlayground(id: string): Promise<Playground> {
  const { data } = await apiClient.get<Playground>(`/playgrounds/${id}`);
  return data;
}

export async function createPlayground(payload: PlaygroundCreate): Promise<Playground> {
  const { data } = await apiClient.post<Playground>("/playgrounds", payload);
  return data;
}

export async function uploadPlaygroundImage(
  playgroundId: string,
  file: File,
): Promise<PlaygroundImage> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<PlaygroundImage>(
    `/playgrounds/${playgroundId}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
