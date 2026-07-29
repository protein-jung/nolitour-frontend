import { fetchTopReporters } from "../api/rankings";
import { RankingPage } from "./RankingPage";

export function ReporterRankingPage() {
  return (
    <RankingPage
      icon="🏆"
      title="제보왕"
      description="놀이터를 가장 많이 제보한 이용자 순위예요."
      emptyText="아직 제보가 없어요."
      unit="건"
      fetchRankings={fetchTopReporters}
    />
  );
}
