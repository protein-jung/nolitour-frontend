import { apiClient } from "./client";
import type { Playground, PlaygroundCreate } from "../types/playground";

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
