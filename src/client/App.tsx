import { Link, Outlet } from "@tanstack/react-router";

export function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <h1>Relay</h1>
        <nav aria-label="Primary">
          <Link to="/">My Catch-Up</Link>
          <Link to="/board">Relay Board</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
