import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { routes } from "../routes";
import type { CatchUpDto, CatchUpItemDto } from "../../server/services/catchUpService";

const sections: Array<[keyof Omit<CatchUpDto, "lastSeenAt">, string]> = [
  ["needsMyReview", "Needs My Review"],
  ["handoffsToMe", "Handoffs To Me"],
  ["unassignedHandoffs", "Unassigned Handoffs"],
  ["myFollowUps", "My Follow-Ups"],
  ["updatedSinceLastSeen", "Updated Since Last Seen"],
  ["staleCases", "Stale Cases"],
  ["recentlyResolved", "Recently Resolved"],
];

export function MyCatchUp() {
  const [data, setData] = useState<CatchUpDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<CatchUpDto>("/api/catch-up")
      .then(setData)
      .catch((caught: Error) => setError(caught.message));
  }, []);

  if (error) return <EmptyState title="Unable to load My Catch-Up" body={error} />;
  if (!data) return <EmptyState title="Loading" body="Gathering your moderation continuity queue." />;

  const hasItems = sections.some(([key]) => data[key].length > 0);

  if (!hasItems) {
    return (
      <section className="screen">
        <EmptyState title="Caught up" body="No reviews, handoffs, follow-ups, or stale cases need attention." />
      </section>
    );
  }

  return (
    <section className="screen">
      {sections.map(([key, title]) => (
        <CatchUpSection items={data[key]} key={key} title={title} />
      ))}
    </section>
  );
}

function CatchUpSection({ title, items }: { title: string; items: CatchUpItemDto[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section">
      <h2>{title}</h2>
      <div className="item-list">
        {items.map((item) => (
          <article className="item-row" key={`${item.kind}:${item.id}`}>
            <a className="item-title" href={item.caseId ? routes.caseDetail(item.caseId) : item.targetPermalink ?? "#"}>
              {item.title}
            </a>
            <div className="meta">
              <StatusBadge value={item.status} />
              <StatusBadge value={item.urgency} />
              <span>{new Date(item.updatedAt).toLocaleString()}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
