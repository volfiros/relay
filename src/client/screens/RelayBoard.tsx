import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { BoardCaseRow } from "../components/BoardCaseRow";
import { BoardFilters } from "../components/BoardFilters";
import { EmptyState } from "../components/EmptyState";
import type { RelayBoardDto } from "../../server/services/boardService";

export function RelayBoard() {
  const [data, setData] = useState<RelayBoardDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<RelayBoardDto>("/api/board")
      .then(setData)
      .catch((caught: Error) => setError(caught.message));
  }, []);

  if (error) return <EmptyState title="Unable to load Relay Board" body={error} />;
  if (!data) return <EmptyState title="Loading" body="Loading shared case continuity." />;

  return (
    <section className="screen">
      <BoardFilters />
      <div className="grid">
        <Summary label="Open cases" value={data.activitySummary.openCaseCount} />
        <Summary label="Pending reviews" value={data.activitySummary.pendingReviewCount} />
        <Summary label="Stale handoffs" value={data.activitySummary.staleHandoffCount} />
        <Summary label="Active follow-ups" value={data.activitySummary.activeFollowUpCount} />
      </div>
      <section className="section">
        <h2>Open Cases</h2>
        <div className="item-list">
          {data.openCases.map((item) => (
            <BoardCaseRow item={item} key={item.id} />
          ))}
        </div>
      </section>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel">
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  );
}
