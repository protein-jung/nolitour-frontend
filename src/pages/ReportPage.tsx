import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NaverMap, type LatLngLiteral } from "../components/NaverMap";
import { createPlayground, uploadPlaygroundImage } from "../api/playgrounds";
import {
  AGE_GROUP_LABEL,
  PLAYGROUND_TYPE_LABEL,
  type AgeGroup,
  type PlaygroundType,
} from "../types/playground";

const PLAYGROUND_TYPES = Object.keys(PLAYGROUND_TYPE_LABEL) as PlaygroundType[];
const AGE_GROUPS = Object.keys(AGE_GROUP_LABEL) as AgeGroup[];

const SEOUL_CENTER: LatLngLiteral = { lat: 37.5665, lng: 126.978 };

export function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState<PlaygroundType | "">("");
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [address, setAddress] = useState("");
  const [directions, setDirections] = useState("");
  const [description, setDescription] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [closedDays, setClosedDays] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: 24, textAlign: "center" }}>
        <p>놀이터 제보는 로그인 후 이용할 수 있습니다.</p>
        <button type="button" onClick={() => navigate("/login")}>
          로그인하러 가기
        </button>
      </div>
    );
  }

  function toggleAgeGroup(ag: AgeGroup) {
    setAgeGroups((prev) => (prev.includes(ag) ? prev.filter((v) => v !== ag) : [...prev, ag]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!position) {
      setError("지도를 클릭해서 놀이터 위치를 지정해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const playground = await createPlayground({
        name,
        type: type || null,
        age_groups: ageGroups.length ? ageGroups : null,
        address,
        directions: directions || null,
        description: description || null,
        latitude: position.lat,
        longitude: position.lng,
        operating_hours: operatingHours || null,
        closed_days: closedDays || null,
        phone: phone || null,
      });

      for (const photo of photos) {
        await uploadPlaygroundImage(playground.id, photo);
      }

      navigate("/map");
    } catch {
      setError("제보 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
      <h1>놀이터 제보하기</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          놀이터 이름 *
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          유형
          <select value={type} onChange={(e) => setType(e.target.value as PlaygroundType)}>
            <option value="">선택 안함</option>
            {PLAYGROUND_TYPES.map((t) => (
              <option key={t} value={t}>
                {PLAYGROUND_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>적합 연령 (복수 선택 가능)</legend>
          {AGE_GROUPS.map((ag) => (
            <label key={ag} style={{ marginRight: 12 }}>
              <input
                type="checkbox"
                checked={ageGroups.includes(ag)}
                onChange={() => toggleAgeGroup(ag)}
              />
              {AGE_GROUP_LABEL[ag]}
            </label>
          ))}
        </fieldset>

        <label>
          주소 *
          <input value={address} onChange={(e) => setAddress(e.target.value)} required />
        </label>

        <label>
          찾아가는 법 (아파트 단지 내인 경우)
          <input value={directions} onChange={(e) => setDirections(e.target.value)} />
        </label>

        <label>
          소개
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        <label>
          영업시간
          <input
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            placeholder="예: 24시간 개방"
          />
        </label>

        <label>
          휴무일
          <input
            value={closedDays}
            onChange={(e) => setClosedDays(e.target.value)}
            placeholder="예: 연중무휴"
          />
        </label>

        <label>
          전화번호
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <div>
          <p>
            지도를 클릭해서 놀이터 위치를 지정해주세요
            {position && ` (${position.lat.toFixed(6)}, ${position.lng.toFixed(6)})`}
          </p>
          <div style={{ height: 320, border: "1px solid #ddd" }}>
            <NaverMap
              playgrounds={[]}
              onMapClick={setPosition}
              pinPosition={position}
              initialCenter={SEOUL_CENTER}
              initialZoom={11}
            />
          </div>
        </div>

        <label>
          사진 (선택, 여러 장 가능)
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
          />
        </label>

        {error && <p style={{ color: "#b00" }}>{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "등록 중..." : "제보하기"}
        </button>
      </form>
    </div>
  );
}
