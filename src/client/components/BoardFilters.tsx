export function BoardFilters() {
  return (
    <div className="panel">
      <h2>Filters</h2>
      <div className="grid">
        <label>
          Status
          <select aria-label="Status filter">
            <option>Any</option>
            <option>Open</option>
            <option>Watching</option>
            <option>Needs Review</option>
            <option>Handed Off</option>
          </select>
        </label>
        <label>
          Urgency
          <select aria-label="Urgency filter">
            <option>Any</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Normal</option>
            <option>Low</option>
          </select>
        </label>
      </div>
    </div>
  );
}
