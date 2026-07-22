import type { LatLngLiteral } from "../components/NaverMap";

/** 좌표로 대략적인 주소 문자열을 역지오코딩한다 (현위치 버튼용). submodules=geocoder 로드가 선행되어야 한다. */
export function reverseGeocode(position: LatLngLiteral): Promise<string | null> {
  return new Promise((resolve) => {
    if (!window.naver?.maps?.Service) {
      resolve(null);
      return;
    }
    const coords = new window.naver.maps.LatLng(position.lat, position.lng);
    window.naver.maps.Service.reverseGeocode(
      {
        coords,
        orders: [window.naver.maps.Service.OrderType.ROAD_ADDR, window.naver.maps.Service.OrderType.ADDR].join(","),
      },
      (status, response) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          resolve(null);
          return;
        }
        const results = response?.v2?.results ?? [];
        if (results.length === 0) {
          resolve(null);
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = results[0] as any;
        const isRoadAddr = result.name === "roadaddr";
        const region = result.region ?? {};
        const land = result.land ?? {};
        // 도로명주소는 동(area3)을 생략, 지번주소는 포함해 "OO동 123-4" 형태로 구성
        const regionParts = isRoadAddr
          ? [region.area1?.name, region.area2?.name]
          : [region.area1?.name, region.area2?.name, region.area3?.name];
        const parts = regionParts.filter(Boolean).join(" ");
        const roadOrJibun = land.name
          ? `${land.name} ${land.number1 ?? ""}${land.number2 ? `-${land.number2}` : ""}`.trim()
          : "";
        const address = `${parts} ${roadOrJibun}`.trim();
        resolve(address || null);
      },
    );
  });
}
