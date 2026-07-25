import { fetchTopReporters } from "../api/rankings";
import { RankingButton } from "./RankingButton";

export function ReporterRankingButton() {
  return (
    <RankingButton
      icon="🏆"
      label="제보왕"
      title="제보왕 TOP 10"
      emptyText="아직 제보가 없어요."
      unit="건"
      fetchRankings={fetchTopReporters}
    />
  );
}
