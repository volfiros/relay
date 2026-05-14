import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api";
import { CaseTimeline } from "../components/CaseTimeline";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import type { CaseCard, CaseEvent } from "../../server/domain/types";

interface CaseDetailDto {
  caseCard: CaseCard;
  events: CaseEvent[];
}

export function CaseDetail({ caseId }: { caseId: string }) {
  const { data, error, isPending } = useCaseDetailQuery(caseId);

  if (error) return <EmptyState title="Unable to load case" body={getErrorMessage(error)} />;
  if (isPending) return <EmptyState title="Loading" body="Loading the case record." />;
  if (!data) return <EmptyState title="Unable to load case" body="Relay did not return case data." />;

  const caseCard = data.caseCard;

  return (
    <section className="screen">
      <div className="panel">
        <h2>{caseCard.title}</h2>
        <div className="meta">
          <StatusBadge value={caseCard.status} />
          <StatusBadge value={caseCard.urgency} />
          <span>{caseCard.category}</span>
        </div>
      </div>

      <div className="grid">
        <div className="panel">
          <h2>Linked Target</h2>
          <a href={caseCard.targetPermalink}>{caseCard.targetPermalink}</a>
          <p className="meta">{caseCard.targetAuthor ?? "Author unavailable"}</p>
        </div>
        <div className="panel">
          <h2>Current Summary</h2>
          <p>{caseCard.summary}</p>
        </div>
      </div>

      <div className="actions">
        <button type="button">Add Note</button>
        <button type="button">Create Handoff</button>
        <button type="button">Request Review</button>
        <button type="button">Add Follow-Up</button>
        <button type="button">Resolve Case</button>
      </div>

      <section className="section">
        <h2>Event History</h2>
        <CaseTimeline events={data.events} />
      </section>
    </section>
  );
}

function useCaseDetailQuery(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: async (): Promise<CaseDetailDto> => {
      const response = await apiGet<CaseDetailDto | CaseCard>(`/api/cases/${encodeURIComponent(caseId)}`);
      if ("caseCard" in response) return response;
      return { caseCard: response, events: [] };
    },
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
