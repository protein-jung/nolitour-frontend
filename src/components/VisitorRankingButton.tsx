import { fetchTopVisitors } from "../api/rankings";
import { RankingButton } from "./RankingButton";

export function VisitorRankingButton() {
  return (
    <RankingButton
      icon="👣"
      label="왔다감왕"
      title="왔다감왕 TOP 10"
      emptyText="아직 체크인 기록이 없어요."
      unit="곳"
      fetchRankings={fetchTopVisitors}
    />
  );
}
