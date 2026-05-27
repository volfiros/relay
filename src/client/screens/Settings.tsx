import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "../api";
import { EmptyState } from "../components/EmptyState";
import type { RelaySettings } from "../../server/services/settingsService";
import type { Urgency } from "../../server/domain/types";

export function Settings() {
  const { data: settings, error, isPending } = useSettingsQuery();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<RelaySettings | null>(null);
  const updateSettings = useMutation({
    mutationFn: (next: RelaySettings) => apiSend<RelaySettings>("/api/settings", "PATCH", next),
    onSuccess(next) {
      setDraft(next);
      queryClient.setQueryData(["settings"], next);
    },
  });

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  if (error) return <EmptyState title="Unable to load settings" body={getErrorMessage(error)} />;
  if (isPending) return <EmptyState title="Loading" body="Loading Relay settings." />;
  if (!settings || !draft) return <EmptyState title="Unable to load settings" body="Relay did not return settings data." />;

  const hasChanges = !settingsEqual(settings, draft);
  const statusText = updateSettings.isError ? getErrorMessage(updateSettings.error) : updateSettings.isSuccess ? "Settings saved" : "Ready";

  function updateDraft(next: Partial<RelaySettings>) {
    setDraft((current) => (current ? { ...current, ...next } : current));
  }

  function updatePersonalFilter(key: keyof RelaySettings["personalFilters"], value: boolean) {
    setDraft((current) =>
      current
        ? {
            ...current,
            personalFilters: {
              ...current.personalFilters,
              [key]: value,
            },
          }
        : current,
    );
  }

  function saveSettings() {
    if (draft) updateSettings.mutate(draft);
  }

  return (
    <section className="screen settings-screen">
      <header className="dashboard-header settings-header">
        <div>
          <p className="eyebrow">Control surface</p>
          <h2>Settings</h2>
          <p>Tune Relay defaults, review flow, and personal queue visibility.</p>
        </div>
        <span className={`save-status ${updateSettings.isError ? "error" : ""}`}>{statusText}</span>
      </header>

      <section className="settings-layout">
        <div className="panel settings-panel">
          <PanelHeading eyebrow="Subreddit defaults" title="Case policy" />
          <div className="settings-grid">
            <TagList label="Case categories" values={draft.caseCategories} />
            <TagList label="Handoff categories" values={draft.handoffCategories} />
            <label className="filter-control settings-control">
              <span>Default urgency</span>
              <select
                aria-label="Default urgency"
                onChange={(event) => updateDraft({ defaultUrgency: event.currentTarget.value as Urgency })}
                value={draft.defaultUrgency}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
        </div>

        <div className="panel settings-panel">
          <PanelHeading eyebrow="Retention" title="Data windows" />
          <div className="retention-grid">
            <NumberField
              label="Ordinary cases"
              onChange={(value) => updateDraft({ retentionDays: value })}
              suffix="days"
              value={draft.retentionDays}
            />
            <NumberField
              label="Sensitive cases"
              onChange={(value) => updateDraft({ sensitiveRetentionDays: value })}
              suffix="days"
              value={draft.sensitiveRetentionDays}
            />
          </div>
        </div>

        <div className="panel settings-panel">
          <PanelHeading eyebrow="Workflow" title="Moderator safeguards" />
          <div className="toggle-list">
            <ToggleRow
              checked={draft.secondReviewEnabled}
              description="Require a second moderator on cases that need extra confidence."
              label="Second review"
              onChange={(value) => updateDraft({ secondReviewEnabled: value })}
            />
            <ToggleRow
              checked={draft.unassignedHandoffsEnabled}
              description="Keep unassigned handoffs visible so work does not stall."
              label="Unassigned handoffs"
              onChange={(value) => updateDraft({ unassignedHandoffsEnabled: value })}
            />
          </div>
        </div>

        <div className="panel settings-panel">
          <PanelHeading eyebrow="Personal queue" title="Catch-up filters" />
          <div className="toggle-list">
            <ToggleRow
              checked={draft.personalFilters.showUnassignedHandoffs}
              description="Show handoffs that need any moderator to claim them."
              label="Show unassigned handoffs"
              onChange={(value) => updatePersonalFilter("showUnassignedHandoffs", value)}
            />
            <ToggleRow
              checked={draft.personalFilters.showStaleCases}
              description="Surface cases that have not moved recently."
              label="Show stale cases"
              onChange={(value) => updatePersonalFilter("showStaleCases", value)}
            />
            <ToggleRow
              checked={draft.personalFilters.compactMode}
              description="Use a denser queue layout for frequent review sessions."
              label="Compact mode"
              onChange={(value) => updatePersonalFilter("compactMode", value)}
            />
          </div>
        </div>
      </section>

      <div className="actions settings-actions">
        <button disabled={!hasChanges || updateSettings.isPending} onClick={saveSettings} type="button">
          {updateSettings.isPending ? "Saving" : "Save changes"}
        </button>
        <button className="button-secondary" disabled={!hasChanges || updateSettings.isPending} onClick={() => setDraft(settings)} type="button">
          Reset changes
        </button>
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

function PanelHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="panel-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}

function TagList({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="settings-field">
      <span>{label}</span>
      <div className="tag-list">
        {values.map((value) => (
          <span className="badge" key={value}>
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function NumberField({ label, onChange, suffix, value }: { label: string; onChange: (value: number) => void; suffix: string; value: number }) {
  return (
    <label className="settings-field numeric-field">
      <span>{label}</span>
      <div>
        <input
          min={1}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          type="number"
          value={value}
        />
        <small>{suffix}</small>
      </div>
    </label>
  );
}

function ToggleRow({ checked, description, label, onChange }: { checked: boolean; description: string; label: string; onChange: (value: boolean) => void }) {
  const id = useMemo(() => `setting-${label.toLowerCase().replaceAll(" ", "-")}`, [label]);

  return (
    <div className="toggle-row">
      <div>
        <label htmlFor={id}>{label}</label>
        <p>{description}</p>
      </div>
      <button
        aria-pressed={checked}
        className={`toggle-button ${checked ? "active" : ""}`}
        id={id}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span>{checked ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

function settingsEqual(left: RelaySettings, right: RelaySettings): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
