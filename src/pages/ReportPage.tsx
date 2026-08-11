import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PlaygroundForm } from "../components/PlaygroundForm";
import { LoginGateCard } from "../components/Shared";
import { createPlayground, uploadPlaygroundImage } from "../api/playgrounds";
import type { PlaygroundCreate } from "../types/playground";
import { colors } from "../styles/theme";

export function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <LoginGateCard message="놀이터 제보는 로그인 후 이용할 수 있습니다." />;
  }

  async function handleSubmit(payload: PlaygroundCreate, photos: File[]) {
    const playground = await createPlayground(payload);
    for (const photo of photos) {
      await uploadPlaygroundImage(playground.id, photo);
    }
    navigate("/map");
  }

  return (
    <div style={{ background: colors.cream, flex: 1 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ textAlign: "center" }}>놀이터 제보하기</h1>
        <p style={{ textAlign: "center", color: colors.textMuted, marginBottom: 28 }}>
          우리 동네 놀이터 정보를 알려주시면 다른 이용자들에게도 큰 도움이 됩니다 🙌
        </p>

        <PlaygroundForm submitLabel="제보하기" submittingLabel="등록 중..." onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
