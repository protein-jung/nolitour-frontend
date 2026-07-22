// 카카오맵 JS SDK 최소 타입 선언 (공식 @types 부재로 직접 선언, services 라이브러리만 사용)
export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao.maps {
    function load(callback: () => void): void;

    namespace services {
      interface PlacesSearchResultItem {
        place_name: string;
        address_name: string;
        road_address_name: string;
        x: string; // 경도
        y: string; // 위도
      }

      class Places {
        keywordSearch(
          keyword: string,
          callback: (data: PlacesSearchResultItem[], status: string) => void,
        ): void;
      }

      const Status: { OK: string; ZERO_RESULT: string; ERROR: string };
    }
  }
}
