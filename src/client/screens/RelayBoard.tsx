import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api";
import { BoardCaseRow } from "../components/BoardCaseRow";
import { BoardFilters, type BoardFilterValues } from "../components/BoardFilters";
import { EmptyState } from "../components/EmptyState";
import type { RelayBoardDto } from "../../server/services/boardService";

export function RelayBoard({ filters }: { filters: BoardFilterValues }) {
  const { data, error, isPending } = useRelayBoardQuery(filters);

  if (error) return <EmptyState title="Unable to load Relay Board" body={getErrorMessage(error)} />;
  if (isPending) return <EmptyState title="Loading" body="Loading shared case continuity." />;
  if (!data) return <EmptyState title="Unable to load Relay Board" body="Relay did not return board data." />;

  return (
    <section className="screen">
      <BoardFilters filters={filters} />
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

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel">
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
