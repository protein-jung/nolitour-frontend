import { useEffect, useState } from "react";
import { NaverMap } from "../components/NaverMap";
import { fetchPlaygrounds } from "../api/playgrounds";
import type { Playground } from "../types/playground";

export function MapPage() {
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [selected, setSelected] = useState<Playground | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaygrounds()
      .then(setPlaygrounds)
      .catch(() => setError("놀이터 목록을 불러오지 못했습니다."));
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, position: "relative" }}>
        {error && (
          <div style={{ position: "absolute", top: 8, left: 8, zIndex: 1, color: "#b00" }}>
            {error}
          </div>
        )}
        <NaverMap playgrounds={playgrounds} onSelect={setSelected} />
      </div>
      {selected && (
        <aside style={{ width: 320, padding: 16, overflowY: "auto", borderLeft: "1px solid #eee" }}>
          <h2>{selected.name}</h2>
          <p>{selected.address}</p>
          {selected.description && <p>{selected.description}</p>}
          {selected.operating_hours && <p>영업시간: {selected.operating_hours}</p>}
          {selected.closed_days && <p>휴무일: {selected.closed_days}</p>}
          {selected.phone && <p>전화: {selected.phone}</p>}
        </aside>
      )}
    </div>
  );
}
