import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api";
import { EmptyState } from "../components/EmptyState";
import type { RelaySettings } from "../../server/services/settingsService";

export function Settings() {
  const { data: settings, error, isPending } = useSettingsQuery();

  if (error) return <EmptyState title="Unable to load settings" body={getErrorMessage(error)} />;
  if (isPending) return <EmptyState title="Loading" body="Loading Relay settings." />;
  if (!settings) return <EmptyState title="Unable to load settings" body="Relay did not return settings data." />;

  return (
    <section className="screen">
      <div className="panel">
        <h2>Subreddit Settings</h2>
        <dl>
          <dt>Case categories</dt>
          <dd>{settings.caseCategories.join(", ")}</dd>
          <dt>Handoff categories</dt>
          <dd>{settings.handoffCategories.join(", ")}</dd>
          <dt>Default urgency</dt>
          <dd>{settings.defaultUrgency}</dd>
          <dt>Retention</dt>
          <dd>
            {settings.retentionDays} days ordinary · {settings.sensitiveRetentionDays} days sensitive
          </dd>
        </dl>
      </div>
      <div className="panel">
        <h2>Workflow Toggles</h2>
        <p>Second review: {settings.secondReviewEnabled ? "Enabled" : "Disabled"}</p>
        <p>Unassigned handoffs: {settings.unassignedHandoffsEnabled ? "Enabled" : "Disabled"}</p>
      </div>
    </section>
  );
}

function useSettingsQuery() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet<RelaySettings>("/api/settings"),
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
