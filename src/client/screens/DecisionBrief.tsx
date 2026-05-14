import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { apiGet } from "../api";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import type { DecisionBriefDto } from "../../server/routes/decisionBriefRoutes";

export function DecisionBrief({ targetType, targetId }: { targetType: "post" | "comment" | null; targetId: string | null }) {
  const hasValidTarget = (targetType === "post" || targetType === "comment") && Boolean(targetId);
  const { data, error, isPending } = useDecisionBriefQuery(targetType, targetId, hasValidTarget);

  if (!hasValidTarget) return <EmptyState title="Unable to load Decision Brief" body="Decision Brief needs a post or comment target." />;
  if (error) return <EmptyState title="Unable to load Decision Brief" body={getErrorMessage(error)} />;
  if (isPending) return <EmptyState title="Loading" body="Gathering target context and prior Relay history." />;
  if (!data) return <EmptyState title="Unable to load Decision Brief" body="Relay did not return decision brief data." />;

  return (
    <section className="screen">
      <div className="panel">
        <h2>Target Item</h2>
        <p>{data.targetSummary}</p>
        <div className="meta">
          <span>{data.targetType}</span>
          <span>{data.targetAuthor ?? "Author unavailable"}</span>
          <a href={data.targetPermalink}>Open on Reddit</a>
        </div>
      </div>

      <div className="grid">
        <BriefPanel title="Thread Context" body={data.parentContext ?? data.threadContext ?? "Context unavailable"} />
        <BriefPanel title="Author Context" body={data.authorContext ?? "Author context unavailable"} />
        <BriefPanel title="Report Signals" body={data.reportContext ?? "Report context unavailable"} />
      </div>

      {data.duplicateWarning && (
        <div className="panel">
          <h2>Duplicate Warning</h2>
          <p>{data.duplicateWarning.title}</p>
          <StatusBadge value={data.duplicateWarning.status} />
        </div>
      )}

      <section className="section">
        <h2>Prior Relay Cases</h2>
        {data.priorCases.length === 0 ? (
          <EmptyState title="No prior cases" body="No saved Relay history was found for this target." />
        ) : (
          <div className="item-list">
            {data.priorCases.map((caseRef) => (
              <article className="item-row" key={caseRef.id}>
                <Link className="item-title" params={{ caseId: caseRef.id }} to="/cases/$caseId">
                  {caseRef.title}
                </Link>
                <StatusBadge value={caseRef.status} />
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="actions">
        <button type="button">Save Case</button>
        <button type="button">Request Review</button>
        <button type="button">Create Handoff</button>
        <button type="button">Mark Follow-Up</button>
      </div>
    </section>
  );
}

function useDecisionBriefQuery(targetType: "post" | "comment" | null, targetId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["decision-brief", targetType, targetId],
    queryFn: () =>
      apiGet<DecisionBriefDto>(
        `/api/decision-brief?targetType=${encodeURIComponent(targetType ?? "")}&targetId=${encodeURIComponent(targetId ?? "")}`,
      ),
    enabled,
  });
}

function BriefPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
