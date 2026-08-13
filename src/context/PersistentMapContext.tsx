import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { NaverMap, type LatLngLiteral, type PlaygroundWithDistance } from "../components/NaverMap";
import type { Playground } from "../types/playground";

export interface PersistentMapProps {
  playgrounds: PlaygroundWithDistance[];
  onSelect?: (playground: Playground) => void;
  onInteractionBlocked?: () => void;
  currentLocation?: LatLngLiteral | null;
  initialCenter?: LatLngLiteral;
  initialZoom?: number;
}

interface PersistentMapContextValue {
  attach: (container: HTMLDivElement) => void;
  detach: (container: HTMLDivElement) => void;
  setProps: (props: PersistentMapProps) => void;
}

const PersistentMapContext = createContext<PersistentMapContextValue | null>(null);

/**
 * 지도 페이지를 벗어났다 돌아와도 naver.maps.Map 인스턴스를 새로 만들지 않도록,
 * 지도 DOM을 앱 최상단에 한 번만 마운트해두고 필요한 곳(슬롯)으로 옮겨 붙인다.
 * 매번 재생성하면 그때마다 네이버 지도 서버에 타일 요청이 다시 나간다.
 */
export function PersistentMapProvider({ children }: { children: ReactNode }) {
  const parkingRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [props, setProps] = useState<PersistentMapProps>({ playgrounds: [] });

  const attach = useCallback((container: HTMLDivElement) => {
    if (rootRef.current && rootRef.current.parentElement !== container) {
      container.appendChild(rootRef.current);
    }
  }, []);

  const detach = useCallback((container: HTMLDivElement) => {
    if (rootRef.current && rootRef.current.parentElement === container && parkingRef.current) {
      parkingRef.current.appendChild(rootRef.current);
    }
  }, []);

  return (
    <PersistentMapContext.Provider value={{ attach, detach, setProps }}>
      {children}
      <div ref={parkingRef} style={{ position: "fixed", top: 0, left: 0, width: 0, height: 0, overflow: "hidden" }}>
        <div ref={rootRef} style={{ width: "100%", height: "100%" }}>
          <NaverMap
            playgrounds={props.playgrounds}
            onSelect={props.onSelect}
            onInteractionBlocked={props.onInteractionBlocked}
            currentLocation={props.currentLocation}
            initialCenter={props.initialCenter}
            initialZoom={props.initialZoom}
          />
        </div>
      </div>
    </PersistentMapContext.Provider>
  );
}

/** MapPage 등에서 지도를 보여줄 자리를 렌더링하고, 이 훅이 그 자리로 영구 지도 DOM을 옮겨 붙인다 */
export function PersistentMapSlot(props: PersistentMapProps) {
  const ctx = useContext(PersistentMapContext);
  if (!ctx) throw new Error("PersistentMapSlot must be used within PersistentMapProvider");
  const { attach, detach, setProps } = ctx;
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProps(props);
  });

  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    attach(el);
    return () => detach(el);
  }, [attach, detach]);

  return <div ref={slotRef} style={{ width: "100%", height: "100%" }} />;
}
