import { useEffect, useState } from "react";

const SCRIPT_ID = "naver-maps-sdk";

/** 네이버 지도 JS SDK를 한 번만 로드하고 준비 여부를 반환한다 */
export function useNaverMapsScript(clientId: string): boolean {
  const [loaded, setLoaded] = useState(() => Boolean(window.naver?.maps));

  useEffect(() => {
    if (loaded || !clientId) return;

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => setLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, [clientId, loaded]);

  return loaded;
}
