import { useEffect, useRef } from "react";
import { useNaverMapsScript } from "../hooks/useNaverMapsScript";
import type { Playground } from "../types/playground";

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
}

export function NaverMap({
  playgrounds,
  onSelect,
  onMapClick,
  pinPosition,
  initialCenter = DEFAULT_CENTER,
  initialZoom = 7,
}: NaverMapProps) {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? "";
  const loaded = useNaverMapsScript(clientId);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const pinMarkerRef = useRef<naver.maps.Marker | null>(null);

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
      });
      if (onSelect) {
        window.naver.maps.Event.addListener(marker, "click", () => onSelect(playground));
      }
      return marker;
    });
  }, [loaded, playgrounds, onSelect]);

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
      pinMarkerRef.current = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(pinPosition.lat, pinPosition.lng),
        map: mapRef.current,
      });
    }
  }, [loaded, pinPosition]);

  if (!clientId) {
    return (
      <div style={{ padding: 16, color: "#b00" }}>
        VITE_NAVER_MAP_CLIENT_ID 가 설정되지 않았습니다. .env 파일을 확인하세요.
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
