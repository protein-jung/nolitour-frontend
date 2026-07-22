import { useEffect, useState } from "react";

const SCRIPT_ID = "kakao-maps-sdk";

/** 카카오맵 JS SDK(services 라이브러리)를 한 번만 로드하고 준비 여부를 반환한다 */
export function useKakaoMapsScript(appKey: string): boolean {
  const [loaded, setLoaded] = useState(() => Boolean(window.kakao?.maps?.services));

  useEffect(() => {
    if (loaded || !appKey) return;

    const markLoaded = () => {
      window.kakao.maps.load(() => setLoaded(true));
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.kakao?.maps) markLoaded();
      else existing.addEventListener("load", markLoaded);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = markLoaded;
    document.head.appendChild(script);
  }, [appKey, loaded]);

  return loaded;
}
