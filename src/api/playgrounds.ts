import { apiClient } from "./client";
import type {
  AgeGroup,
  CommentImage,
  CommentReply,
  EquipmentType,
  LikeStatus,
  Playground,
  PlaygroundComment,
  PlaygroundCreate,
  PlaygroundEdit,
  PlaygroundImage,
  RiskTag,
  SaveStatus,
  VisitResult,
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

export async function updatePlayground(
  id: string,
  payload: PlaygroundCreate,
): Promise<Playground> {
  const { data } = await apiClient.patch<Playground>(`/playgrounds/${id}`, payload);
  return data;
}

export async function fetchPlaygroundEdits(id: string): Promise<PlaygroundEdit[]> {
  const { data } = await apiClient.get<PlaygroundEdit[]>(`/playgrounds/${id}/edits`);
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

export async function savePlayground(playgroundId: string): Promise<SaveStatus> {
  const { data } = await apiClient.post<SaveStatus>(`/playgrounds/${playgroundId}/save`);
  return data;
}

export async function unsavePlayground(playgroundId: string): Promise<SaveStatus> {
  const { data } = await apiClient.delete<SaveStatus>(`/playgrounds/${playgroundId}/save`);
  return data;
}

export async function fetchComments(playgroundId: string): Promise<PlaygroundComment[]> {
  const { data } = await apiClient.get<PlaygroundComment[]>(`/playgrounds/${playgroundId}/comments`);
  return data;
}

export interface CreateCommentPayload {
  content: string;
  rating?: number | null;
  recommended_ages?: AgeGroup[] | null;
  risk_tags?: RiskTag[] | null;
}

export async function createComment(
  playgroundId: string,
  payload: CreateCommentPayload,
): Promise<PlaygroundComment> {
  const { data } = await apiClient.post<PlaygroundComment>(
    `/playgrounds/${playgroundId}/comments`,
    payload,
  );
  return data;
}

export async function deleteComment(playgroundId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/playgrounds/${playgroundId}/comments/${commentId}`);
}

export async function checkInPlayground(
  playgroundId: string,
  position: { lat: number; lng: number },
): Promise<VisitResult> {
  const { data } = await apiClient.post<VisitResult>(`/playgrounds/${playgroundId}/visit`, {
    latitude: position.lat,
    longitude: position.lng,
  });
  return data;
}

export async function likeComment(playgroundId: string, commentId: string): Promise<LikeStatus> {
  const { data } = await apiClient.post<LikeStatus>(
    `/playgrounds/${playgroundId}/comments/${commentId}/like`,
  );
  return data;
}

export async function unlikeComment(playgroundId: string, commentId: string): Promise<LikeStatus> {
  const { data } = await apiClient.delete<LikeStatus>(
    `/playgrounds/${playgroundId}/comments/${commentId}/like`,
  );
  return data;
}

export async function fetchCommentReplies(
  playgroundId: string,
  commentId: string,
): Promise<CommentReply[]> {
  const { data } = await apiClient.get<CommentReply[]>(
    `/playgrounds/${playgroundId}/comments/${commentId}/replies`,
  );
  return data;
}

export async function createCommentReply(
  playgroundId: string,
  commentId: string,
  content: string,
): Promise<CommentReply> {
  const { data } = await apiClient.post<CommentReply>(
    `/playgrounds/${playgroundId}/comments/${commentId}/replies`,
    { content },
  );
  return data;
}

export async function deleteCommentReply(
  playgroundId: string,
  commentId: string,
  replyId: string,
): Promise<void> {
  await apiClient.delete(`/playgrounds/${playgroundId}/comments/${commentId}/replies/${replyId}`);
}

export async function uploadCommentImage(
  playgroundId: string,
  commentId: string,
  file: File,
): Promise<CommentImage> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<CommentImage>(
    `/playgrounds/${playgroundId}/comments/${commentId}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
