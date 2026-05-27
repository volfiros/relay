import { useNavigate } from "@tanstack/react-router";

export interface BoardFilterValues {
  status: "" | "open" | "watching" | "needs_review" | "handed_off";
  urgency: "" | "urgent" | "high" | "normal" | "low";
}

export function BoardFilters({ filters }: { filters: BoardFilterValues }) {
  const navigate = useNavigate({ from: "/board" });

  function updateFilter(next: Partial<BoardFilterValues>) {
    const values = { ...filters, ...next };
    void navigate({
      search: {
        status: values.status,
        urgency: values.urgency,
      },
    });
  }

  return (
    <div className="panel filter-panel">
      <div>
        <p className="eyebrow">Filters</p>
        <h2>Refine board</h2>
      </div>
      <div className="grid filter-grid">
        <label className="filter-control">
          <span>Status</span>
          <select aria-label="Status filter" onChange={(event) => updateFilter({ status: event.currentTarget.value as BoardFilterValues["status"] })} value={filters.status}>
            <option value="">Any</option>
            <option value="open">Open</option>
            <option value="watching">Watching</option>
            <option value="needs_review">Needs Review</option>
            <option value="handed_off">Handed Off</option>
          </select>
        </label>
        <label className="filter-control">
          <span>Urgency</span>
          <select aria-label="Urgency filter" onChange={(event) => updateFilter({ urgency: event.currentTarget.value as BoardFilterValues["urgency"] })} value={filters.urgency}>
            <option value="">Any</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>
    </div>
  );
}
