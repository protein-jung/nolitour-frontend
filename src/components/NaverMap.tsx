import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useNaverMapsScript } from "../hooks/useNaverMapsScript";
import type { Playground } from "../types/playground";
import { colors } from "../styles/theme";
import { formatDistance } from "../lib/geo";
import notVisitedMarker from "../assets/not_visited_marker.png";

export type PlaygroundWithDistance = Playground & { distanceM?: number | null };

// 마커 위 배지 줄(거리·"지금 보는 중")의 고정 높이 + 핀과의 간격. box-sizing: border-box로 실제 렌더 높이를 이 값과 정확히 맞춰서
// 핀 바로 위에 틈 없이 붙어 보이도록 앵커를 계산한다.
const BADGE_HEIGHT = 20;
const BADGE_GAP = 4;
const BADGE_ROW_BLOCK_HEIGHT = BADGE_HEIGHT + BADGE_GAP;

function badgeRowHtml(distanceM: number | null | undefined, activeViewers: number): string {
  const distanceBadge =
    typeof distanceM === "number"
      ? `
        <span style="
          display: inline-flex; align-items: center; white-space: nowrap;
          height: ${BADGE_HEIGHT}px; box-sizing: border-box;
          background: #fff;
          color: ${colors.brown};
          border: 1px solid ${colors.creamDeep};
          border-radius: 999px;
          padding: 0 7px;
          font-family: 'Jua', sans-serif;
          font-size: 11px;
          box-shadow: 0 1px 4px rgba(92, 61, 38, 0.25);
        ">${formatDistance(distanceM)}</span>
      `
      : "";
  const viewerBadge =
    activeViewers > 0
      ? `
        <span style="
          display: inline-flex; align-items: center; white-space: nowrap;
          height: ${BADGE_HEIGHT}px; box-sizing: border-box;
          background: ${colors.pink};
          color: #fff;
          border: 2px solid #fff;
          border-radius: 999px;
          padding: 0 8px;
          font-family: 'Jua', sans-serif;
          font-size: 11px;
          box-shadow: 0 1px 4px rgba(92, 61, 38, 0.3);
        ">🔥 ${activeViewers}</span>
      `
      : "";
  if (!distanceBadge && !viewerBadge) return "";
  return `
    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: ${BADGE_GAP}px;">
      ${distanceBadge}${viewerBadge}
    </div>
  `;
}

function notVisitedMarkerIcon(
  distanceM: number | null | undefined,
  activeViewers: number,
): naver.maps.ImageIcon | naver.maps.HtmlIcon {
  const badgeRow = badgeRowHtml(distanceM, activeViewers);
  if (!badgeRow) {
    return {
      url: notVisitedMarker,
      size: new window.naver.maps.Size(40, 40),
      scaledSize: new window.naver.maps.Size(40, 40),
      anchor: new window.naver.maps.Point(20, 33),
    };
  }
  return {
    content: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        ${badgeRow}
        <img src="${notVisitedMarker}" style="width: 40px; height: 40px; display: block;" />
      </div>
    `,
    anchor: new window.naver.maps.Point(20, 33 + BADGE_ROW_BLOCK_HEIGHT),
  };
}

function reviewedMarkerIcon(distanceM: number | null | undefined, activeViewers: number): naver.maps.HtmlIcon {
  const badgeRow = badgeRowHtml(distanceM, activeViewers);
  return {
    content: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        ${badgeRow}
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
      </div>
    `,
    anchor: new window.naver.maps.Point(17, 32 + (badgeRow ? BADGE_ROW_BLOCK_HEIGHT : 0)),
  };
}

function visitedMarkerIcon(distanceM: number | null | undefined, activeViewers: number): naver.maps.HtmlIcon {
  const badgeRow = badgeRowHtml(distanceM, activeViewers);
  return {
    content: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        ${badgeRow}
        <div style="
          width: 34px; height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${colors.green};
          border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(92, 61, 38, 0.35);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 15px; line-height: 1;">👣</span>
        </div>
      </div>
    `,
    anchor: new window.naver.maps.Point(17, 32 + (badgeRow ? BADGE_ROW_BLOCK_HEIGHT : 0)),
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

// 지도를 축소해서 축척이 대략 1,000m를 넘어가면(줌 12 미만) "지금 보는 중" 배지는 마커가 너무 빽빽해 보여서 숨긴다.
const ACTIVE_VIEWER_BADGE_MIN_ZOOM = 12;

const DEFAULT_CENTER = { lat: 36.5, lng: 127.8 }; // 대한민국 중심 근방

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface NaverMapProps {
  playgrounds: PlaygroundWithDistance[];
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

export interface NaverMapHandle {
  /** 지도 중심과 줌 레벨을 즉시 이동시킨다 (예: "현위치로" 버튼 클릭 시 50m 축척으로 확대) */
  zoomTo: (position: LatLngLiteral, zoom: number) => void;
}

export const NaverMap = forwardRef<NaverMapHandle, NaverMapProps>(function NaverMap({
  playgrounds,
  onSelect,
  onMapClick,
  pinPosition,
  initialCenter = DEFAULT_CENTER,
  initialZoom = 7,
  onInteractionBlocked,
  currentLocation,
}, ref) {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? "";
  const loaded = useNaverMapsScript(clientId);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const pinMarkerRef = useRef<naver.maps.Marker | null>(null);
  const currentLocationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const [zoomLevel, setZoomLevel] = useState(initialZoom);

  useImperativeHandle(ref, () => ({
    zoomTo(position, zoom) {
      if (!mapRef.current) return;
      mapRef.current.setCenter(new window.naver.maps.LatLng(position.lat, position.lng));
      mapRef.current.setZoom(zoom);
    },
  }));

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
    const listener = window.naver.maps.Event.addListener(mapRef.current, "zoom_changed", () => {
      setZoomLevel(mapRef.current!.getZoom());
    });
    return () => {
      window.naver.maps.Event.removeListener(listener);
    };
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const showActiveViewers = zoomLevel >= ACTIVE_VIEWER_BADGE_MIN_ZOOM;
    markersRef.current.forEach((marker) => marker.setMap(null));
    const newMarkers: naver.maps.Marker[] = [];
    playgrounds.forEach((playground) => {
      const position = new window.naver.maps.LatLng(playground.latitude, playground.longitude);
      const activeViewers = showActiveViewers ? playground.active_viewers : 0;
      const marker = new window.naver.maps.Marker({
        position,
        map: mapRef.current!,
        title: playground.name,
        icon: playground.reviewed_by_me
          ? reviewedMarkerIcon(playground.distanceM, activeViewers)
          : playground.visited_by_me
            ? visitedMarkerIcon(playground.distanceM, activeViewers)
            : notVisitedMarkerIcon(playground.distanceM, activeViewers),
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
      newMarkers.push(marker);
    });
    markersRef.current = newMarkers;
  }, [loaded, playgrounds, onSelect, onInteractionBlocked, zoomLevel]);

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
});
