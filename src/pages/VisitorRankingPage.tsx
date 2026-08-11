import { fetchTopVisitors } from "../api/rankings";
import { IconFootprints } from "../components/Shared";
import { RankingPage } from "./RankingPage";

export function VisitorRankingPage() {
  return (
    <RankingPage
      icon={<IconFootprints size={28} />}
      title="왔다감왕"
      description="놀이터에 가장 많이 체크인(왔다감)한 이용자 순위예요."
      emptyText="아직 체크인 기록이 없어요."
      unit="곳"
      fetchRankings={fetchTopVisitors}
    />
  );
}
