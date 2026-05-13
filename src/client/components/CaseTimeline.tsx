import type { CaseEvent } from "../../server/domain/types";

export function CaseTimeline({ events }: { events: CaseEvent[] }) {
  if (events.length === 0) {
    return <p className="meta">No event history yet.</p>;
  }

  return (
    <div className="item-list">
      {events.map((event) => (
        <article className="item-row" key={event.id}>
          <strong>{event.eventType.replaceAll("_", " ")}</strong>
          <span className="meta">
            {event.actorModId} · {new Date(event.createdAt).toLocaleString()}
          </span>
        </article>
      ))}
    </div>
  );
}
