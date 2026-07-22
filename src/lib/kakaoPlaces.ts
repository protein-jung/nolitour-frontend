import type { AddressSuggestion } from "../types/address";

/** 키워드로 장소/주소를 검색한다 (몇 글자만 입력해도 후보를 반환하는 실시간 자동완성용) */
export function searchPlaces(query: string): Promise<AddressSuggestion[]> {
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services || !query.trim()) {
      resolve([]);
      return;
    }
    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(query, (data, status) => {
      if (status !== window.kakao.maps.services.Status.OK) {
        resolve([]);
        return;
      }
      resolve(
        data.map((item) => ({
          roadAddress: item.road_address_name || item.address_name || item.place_name,
          jibunAddress: item.address_name || item.road_address_name || item.place_name,
          lat: Number(item.y),
          lng: Number(item.x),
        })),
      );
    });
  });
}
