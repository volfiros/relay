import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api";
import { BoardCaseRow } from "../components/BoardCaseRow";
import { BoardFilters, type BoardFilterValues } from "../components/BoardFilters";
import { EmptyState } from "../components/EmptyState";
import type { RelayBoardDto } from "../../server/services/boardService";

export function RelayBoard({ filters }: { filters: BoardFilterValues }) {
  const { data, error, isPending } = useRelayBoardQuery(filters);

  if (error) return <EmptyState title="Unable to load Relay Board" body={getErrorMessage(error)} />;
  if (isPending) return <RelayBoardSkeleton />;
  if (!data) return <EmptyState title="Unable to load Relay Board" body="Relay did not return board data." />;

  return (
    <section className="screen relay-board-screen">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Moderator command center</p>
          <h2>Relay Board</h2>
          <p>Shared continuity for cases that need follow-through.</p>
        </div>
        <span className="live-status">
          <span aria-hidden="true" />
          Live status
        </span>
      </header>
      <BoardFilters filters={filters} />
      <div className="grid summary-grid">
        <Summary accent="teal" detail="Current queue" label="Open cases" value={data.activitySummary.openCaseCount} />
        <Summary accent="slate" detail="Awaiting decision" label="Pending reviews" value={data.activitySummary.pendingReviewCount} />
        <Summary accent="amber" detail="Past handoff SLA" label="Stale handoffs" value={data.activitySummary.staleHandoffCount} />
        <Summary accent="coral" detail="Scheduled checks" label="Active follow-ups" value={data.activitySummary.activeFollowUpCount} />
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Work queue</p>
            <h2>Open Cases</h2>
          </div>
          <span className="queue-count">{data.openCases.length} cases</span>
        </div>
        <div className="item-list">
          {data.openCases.map((item) => (
            <BoardCaseRow item={item} key={item.id} />
          ))}
        </div>
      </section>
    </section>
  );
}

function useRelayBoardQuery(filters: BoardFilterValues) {
  return useQuery({
    queryKey: ["board", filters],
    queryFn: () => apiGet<RelayBoardDto>(`/api/board${toBoardQueryString(filters)}`),
  });
}

function toBoardQueryString(filters: BoardFilterValues): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.urgency) params.set("urgency", filters.urgency);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function Summary({ accent, detail, label, value }: { accent: "amber" | "coral" | "slate" | "teal"; detail: string; label: string; value: number }) {
  return (
    <div className={`panel summary-card summary-${accent}`}>
      <span>{detail}</span>
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  );
}

function RelayBoardSkeleton() {
  return (
    <section className="screen relay-board-screen" aria-busy="true" aria-label="Loading Relay Board">
      <div className="dashboard-header skeleton-block" />
      <div className="panel filter-panel skeleton-block" />
      <div className="grid summary-grid">
        {["open", "review", "handoff", "followup"].map((item) => (
          <div className="panel summary-card skeleton-block" key={item} />
        ))}
      </div>
      <div className="section">
        <div className="item-list">
          {["first", "second", "third"].map((item) => (
            <div className="item-row skeleton-block" key={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
