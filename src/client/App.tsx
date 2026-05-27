import { Link, Outlet } from "@tanstack/react-router";

export function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup" aria-label="Relay">
          <span className="brand-mark">R</span>
          <h1>Relay</h1>
        </div>
        <nav aria-label="Primary">
          <Link activeOptions={{ exact: true }} activeProps={{ className: "active" }} to="/">
            My Catch-Up
          </Link>
          <Link activeProps={{ className: "active" }} to="/board">
            Relay Board
          </Link>
          <Link activeProps={{ className: "active" }} to="/settings">
            Settings
          </Link>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
