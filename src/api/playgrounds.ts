import { apiClient } from "./client";
import type {
  AgeGroup,
  EquipmentType,
  LikeStatus,
  Playground,
  PlaygroundComment,
  PlaygroundCreate,
  PlaygroundImage,
} from "../types/playground";

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface PlaygroundFilters {
  ageGroup?: AgeGroup[];
  hasShade?: boolean;
  hasParking?: boolean;
  hasRestroom?: boolean;
  equipment?: EquipmentType[];
}

export async function fetchPlaygrounds(
  bbox?: BoundingBox,
  filters?: PlaygroundFilters,
): Promise<Playground[]> {
  const { data } = await apiClient.get<Playground[]>("/playgrounds", {
    params: {
      ...(bbox && {
        min_lat: bbox.minLat,
        max_lat: bbox.maxLat,
        min_lng: bbox.minLng,
        max_lng: bbox.maxLng,
      }),
      ...(filters?.ageGroup?.length && { age_group: filters.ageGroup }),
      ...(filters?.hasShade && { has_shade: true }),
      ...(filters?.hasParking && { has_parking: true }),
      ...(filters?.hasRestroom && { has_restroom: true }),
      ...(filters?.equipment?.length && { equipment: filters.equipment }),
    },
    paramsSerializer: { indexes: null },
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

export async function fetchMyPlaygrounds(): Promise<Playground[]> {
  const { data } = await apiClient.get<Playground[]>("/playgrounds/mine");
  return data;
}

export async function likePlayground(playgroundId: string): Promise<LikeStatus> {
  const { data } = await apiClient.post<LikeStatus>(`/playgrounds/${playgroundId}/like`);
  return data;
}

export async function unlikePlayground(playgroundId: string): Promise<LikeStatus> {
  const { data } = await apiClient.delete<LikeStatus>(`/playgrounds/${playgroundId}/like`);
  return data;
}

export async function fetchComments(playgroundId: string): Promise<PlaygroundComment[]> {
  const { data } = await apiClient.get<PlaygroundComment[]>(`/playgrounds/${playgroundId}/comments`);
  return data;
}

export async function createComment(
  playgroundId: string,
  content: string,
): Promise<PlaygroundComment> {
  const { data } = await apiClient.post<PlaygroundComment>(`/playgrounds/${playgroundId}/comments`, {
    content,
  });
  return data;
}

export async function deleteComment(playgroundId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/playgrounds/${playgroundId}/comments/${commentId}`);
}
