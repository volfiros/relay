import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { apiGet } from "../api";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
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
  const { data, error, isPending } = useCatchUpQuery();

  if (error) return <EmptyState title="Unable to load My Catch-Up" body={getErrorMessage(error)} />;
  if (isPending) return <EmptyState title="Loading" body="Gathering your moderation continuity queue." />;
  if (!data) return <EmptyState title="Unable to load My Catch-Up" body="Relay did not return catch-up data." />;

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

function useCatchUpQuery() {
  return useQuery({
    queryKey: ["catch-up"],
    queryFn: () => apiGet<CatchUpDto>("/api/catch-up"),
  });
}

function CatchUpSection({ title, items }: { title: string; items: CatchUpItemDto[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section">
      <h2>{title}</h2>
      <div className="item-list">
        {items.map((item) => (
          <article className="item-row" key={`${item.kind}:${item.id}`}>
            {item.caseId ? (
              <Link className="item-title" params={{ caseId: item.caseId }} to="/cases/$caseId">
                {item.title}
              </Link>
            ) : (
              <a className="item-title" href={item.targetPermalink ?? "#"}>
                {item.title}
              </a>
            )}
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
