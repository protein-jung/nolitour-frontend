import { useEffect, useRef } from "react";
import { useNaverMapsScript } from "../hooks/useNaverMapsScript";
import type { Playground } from "../types/playground";

const DEFAULT_CENTER = { lat: 36.5, lng: 127.8 }; // 대한민국 중심 근방

interface NaverMapProps {
  playgrounds: Playground[];
  onSelect?: (playground: Playground) => void;
}

export function NaverMap({ playgrounds, onSelect }: NaverMapProps) {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? "";
  const loaded = useNaverMapsScript(clientId);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);

  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current) return;

    mapRef.current = new window.naver.maps.Map(containerRef.current, {
      center: new window.naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      zoom: 7,
      minZoom: 6,
    });
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

  if (!clientId) {
    return (
      <div style={{ padding: 16, color: "#b00" }}>
        VITE_NAVER_MAP_CLIENT_ID 가 설정되지 않았습니다. .env 파일을 확인하세요.
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
