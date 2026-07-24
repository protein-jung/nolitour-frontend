import { useEffect, useRef } from "react";
import { useNaverMapsScript } from "../hooks/useNaverMapsScript";
import type { Playground } from "../types/playground";
import { colors } from "../styles/theme";

function reviewedMarkerIcon(): naver.maps.HtmlIcon {
  return {
    content: `
      <div style="
        width: 34px; height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${colors.yellow};
        border: 3px solid #fff;
        box-shadow: 0 2px 6px rgba(92, 61, 38, 0.35);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 15px; line-height: 1;">🏆</span>
      </div>
    `,
    size: new window.naver.maps.Size(34, 34),
    anchor: new window.naver.maps.Point(17, 32),
  };
}

function currentLocationIcon(): naver.maps.HtmlIcon {
  return {
    content: `
      <div style="width: 22px; height: 22px; position: relative;">
        <div style="
          position: absolute; inset: -9px;
          border-radius: 50%;
          background: rgba(73, 145, 204, 0.25);
        "></div>
        <div style="
          position: absolute; inset: 0;
          border-radius: 50%;
          background: ${colors.blue};
          border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        "></div>
      </div>
    `,
    size: new window.naver.maps.Size(22, 22),
    anchor: new window.naver.maps.Point(11, 11),
  };
}

const DEFAULT_CENTER = { lat: 36.5, lng: 127.8 }; // 대한민국 중심 근방

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface NaverMapProps {
  playgrounds: Playground[];
  onSelect?: (playground: Playground) => void;
  /** 지정하면 지도 클릭 시 좌표를 전달한다 (놀이터 제보용 위치 선택 모드) */
  onMapClick?: (position: LatLngLiteral) => void;
  /** onMapClick과 함께 사용, 선택된 위치에 고정 핀을 표시한다 */
  pinPosition?: LatLngLiteral | null;
  initialCenter?: LatLngLiteral;
  initialZoom?: number;
  /** 지정하면 확대/축소·드래그·마커 클릭 시 onSelect 대신 이 콜백이 호출된다 (비로그인 사용자 로그인 유도용) */
  onInteractionBlocked?: () => void;
  /** 지정하면 현재 위치를 파란 점으로 지도에 표시한다 */
  currentLocation?: LatLngLiteral | null;
}

export function NaverMap({
  playgrounds,
  onSelect,
  onMapClick,
  pinPosition,
  initialCenter = DEFAULT_CENTER,
  initialZoom = 7,
  onInteractionBlocked,
  currentLocation,
}: NaverMapProps) {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? "";
  const loaded = useNaverMapsScript(clientId);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const pinMarkerRef = useRef<naver.maps.Marker | null>(null);
  const currentLocationMarkerRef = useRef<naver.maps.Marker | null>(null);

  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current) return;

    mapRef.current = new window.naver.maps.Map(containerRef.current, {
      center: new window.naver.maps.LatLng(initialCenter.lat, initialCenter.lng),
      zoom: initialZoom,
      minZoom: 6,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = playgrounds.map((playground) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(playground.latitude, playground.longitude),
        map: mapRef.current!,
        title: playground.name,
        ...(playground.reviewed_by_me ? { icon: reviewedMarkerIcon() } : {}),
      });
      if (onSelect) {
        window.naver.maps.Event.addListener(marker, "click", () => {
          if (onInteractionBlocked) {
            onInteractionBlocked();
            return;
          }
          onSelect(playground);
        });
      }
      return marker;
    });
  }, [loaded, playgrounds, onSelect, onInteractionBlocked]);

  useEffect(() => {
    if (!loaded || !mapRef.current || !onInteractionBlocked) return;

    const zoomListener = window.naver.maps.Event.addListener(mapRef.current, "zoom_changed", () => {
      onInteractionBlocked();
    });
    const dragListener = window.naver.maps.Event.addListener(mapRef.current, "dragstart", () => {
      onInteractionBlocked();
    });
    return () => {
      window.naver.maps.Event.removeListener(zoomListener);
      window.naver.maps.Event.removeListener(dragListener);
    };
  }, [loaded, onInteractionBlocked]);

  useEffect(() => {
    if (!loaded || !mapRef.current || !onMapClick) return;

    const listener = window.naver.maps.Event.addListener(mapRef.current, "click", (e: unknown) => {
      const { coord } = e as naver.maps.PointerEvent;
      onMapClick({ lat: coord.lat(), lng: coord.lng() });
    });
    return () => {
      window.naver.maps.Event.removeListener(listener);
    };
  }, [loaded, onMapClick]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    pinMarkerRef.current?.setMap(null);
    pinMarkerRef.current = null;
    if (pinPosition) {
      const latLng = new window.naver.maps.LatLng(pinPosition.lat, pinPosition.lng);
      const marker = new window.naver.maps.Marker({
        position: latLng,
        map: mapRef.current,
        draggable: Boolean(onMapClick),
      });
      if (onMapClick) {
        window.naver.maps.Event.addListener(marker, "dragend", () => {
          const dragged = marker.getPosition();
          onMapClick({ lat: dragged.lat(), lng: dragged.lng() });
        });
      }
      pinMarkerRef.current = marker;
      mapRef.current.setCenter(latLng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, pinPosition]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    currentLocationMarkerRef.current?.setMap(null);
    currentLocationMarkerRef.current = null;
    if (currentLocation) {
      currentLocationMarkerRef.current = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng),
        map: mapRef.current,
        title: "현재 위치",
        icon: currentLocationIcon(),
      });
    }
  }, [loaded, currentLocation]);

  if (!clientId) {
    return (
      <div style={{ padding: 16, color: "#b00" }}>
        VITE_NAVER_MAP_CLIENT_ID 가 설정되지 않았습니다. .env 파일을 확인하세요.
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
