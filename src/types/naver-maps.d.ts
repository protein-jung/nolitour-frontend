// 네이버 지도 JS API 최소 타입 선언 (공식 @types 부재로 직접 선언)
export {};

declare global {
  interface Window {
    naver: typeof naver;
  }

  namespace naver.maps {
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface PointerEvent {
      coord: LatLng;
    }

    class Map {
      constructor(el: HTMLElement | string, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getBounds(): unknown;
      getZoom(): number;
      setZoom(zoom: number): void;
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
      getPosition(): LatLng;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    interface HtmlIcon {
      content: string;
      size?: Size;
      anchor?: Point;
    }

    interface ImageIcon {
      url: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      draggable?: boolean;
      icon?: HtmlIcon | ImageIcon;
      clickable?: boolean;
    }

    namespace Event {
      function addListener(
        target: unknown,
        eventName: string,
        handler: (...args: unknown[]) => void,
      ): unknown;
      function removeListener(listener: unknown): void;
      function trigger(target: unknown, eventName: string): void;
    }

    // submodules=geocoder 로딩 시에만 사용 가능
    namespace Service {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function geocode(options: { query: string }, callback: (status: string, response: any) => void): void;
      function reverseGeocode(
        options: { coords: LatLng; orders?: string },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (status: string, response: any) => void,
      ): void;

      const Status: { OK: string; ERROR: string };
      const OrderType: { ADDR: string; ROAD_ADDR: string };
    }
  }
}
