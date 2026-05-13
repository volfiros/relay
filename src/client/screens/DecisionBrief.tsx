import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { routes } from "../routes";
import type { DecisionBriefDto } from "../../server/routes/decisionBriefRoutes";

export function DecisionBrief() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const targetType = params.get("targetType");
  const targetId = params.get("targetId");
  const [data, setData] = useState<DecisionBriefDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ((targetType !== "post" && targetType !== "comment") || !targetId) {
      setError("Decision Brief needs a post or comment target.");
      return;
    }
    apiGet<DecisionBriefDto>(`/api/decision-brief?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}`)
      .then(setData)
      .catch((caught: Error) => setError(caught.message));
  }, [targetId, targetType]);

  if (error) return <EmptyState title="Unable to load Decision Brief" body={error} />;
  if (!data) return <EmptyState title="Loading" body="Gathering target context and prior Relay history." />;

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
                <a className="item-title" href={routes.caseDetail(caseRef.id)}>
                  {caseRef.title}
                </a>
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

function BriefPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}
