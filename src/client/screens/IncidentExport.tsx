import { EmptyState } from "../components/EmptyState";

export function IncidentExport() {
  return (
    <section className="screen">
      <EmptyState title="Incident Export" body="Exported case summaries include links, timestamps, status history, and moderator-authored notes." />
    </section>
  );
}
