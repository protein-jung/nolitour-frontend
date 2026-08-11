import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PlaygroundForm } from "../components/PlaygroundForm";
import { LoginGateCard } from "../components/Shared";
import { fetchPlayground, updatePlayground, uploadPlaygroundImage } from "../api/playgrounds";
import type { Playground, PlaygroundCreate } from "../types/playground";
import { cardStyle, colors } from "../styles/theme";

export function EditPlaygroundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [playground, setPlayground] = useState<Playground | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchPlayground(id)
      .then(setPlayground)
      .catch(() => setLoadError("놀이터 정보를 불러오지 못했습니다."));
  }, [id]);

  if (!user) {
    return <LoginGateCard message="놀이터 정보 수정은 로그인 후 이용할 수 있습니다." />;
  }

  if (loadError) {
    return (
      <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "80px auto", padding: 32, textAlign: "center" }}>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  if (!playground || !id) {
    return (
      <div style={{ background: colors.cream, flex: 1, display: "flex" }}>
        <p style={{ margin: "80px auto", color: colors.textMuted }}>불러오는 중...</p>
      </div>
    );
  }

  async function handleSubmit(payload: PlaygroundCreate, photos: File[]) {
    await updatePlayground(id!, payload);
    for (const photo of photos) {
      await uploadPlaygroundImage(id!, photo);
    }
    navigate("/map");
  }

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ textAlign: "center" }}>놀이터 정보 수정하기</h1>
        <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: 8 }}>
          나무위키처럼 누구나 정보를 고칠 수 있어요. 바뀐 내용은 수정 이력에 기록됩니다 ✏️
        </p>
        <p style={{ textAlign: "center", marginBottom: 28 }}>
          <Link to={`/playgrounds/${id}/edits`} style={{ fontSize: 13, color: colors.textMuted }}>
            📜 이 놀이터의 수정 이력 보기
          </Link>
        </p>

        <PlaygroundForm
          initial={playground}
          submitLabel="수정 완료"
          submittingLabel="저장 중..."
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
