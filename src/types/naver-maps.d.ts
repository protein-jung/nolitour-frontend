// 네이버 지도 JS API 최소 타입 선언 (공식 @types 부재로 직접 선언)
export {};

declare global {
  interface Window {
    naver: typeof naver;
  }

  namespace naver.maps {
    class LatLng {
      constructor(lat: number, lng: number);
    }

    class Map {
      constructor(el: HTMLElement | string, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getBounds(): unknown;
    }

    interface MapOptions {
      center: LatLng;
      zoom?: number;
      minZoom?: number;
      maxZoom?: number;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
    }

    namespace Event {
      function addListener(
        target: unknown,
        eventName: string,
        handler: (...args: unknown[]) => void,
      ): unknown;
    }
  }
}
