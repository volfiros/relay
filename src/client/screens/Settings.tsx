import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { EmptyState } from "../components/EmptyState";
import type { RelaySettings } from "../../server/services/settingsService";

export function Settings() {
  const [settings, setSettings] = useState<RelaySettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<RelaySettings>("/api/settings")
      .then(setSettings)
      .catch((caught: Error) => setError(caught.message));
  }, []);

  if (error) return <EmptyState title="Unable to load settings" body={error} />;
  if (!settings) return <EmptyState title="Loading" body="Loading Relay settings." />;

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
