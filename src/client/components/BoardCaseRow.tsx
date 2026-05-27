import { Link } from "@tanstack/react-router";
import { StatusBadge } from "./StatusBadge";
import type { BoardCaseDto } from "../../server/services/boardService";

export function BoardCaseRow({ item }: { item: BoardCaseDto }) {
  return (
    <article className="item-row">
      <div className="item-main">
        <Link className="item-title" params={{ caseId: item.id }} to="/cases/$caseId">
          {item.title}
        </Link>
        <div className="meta">
          <span>{item.category}</span>
          <span>{item.ownerModId}</span>
          <span>Updated {formatUpdatedAt(item.updatedAt)}</span>
        </div>
      </div>
      <div className="item-status">
        <StatusBadge value={item.status} />
        <StatusBadge value={item.urgency} />
        <span className="row-chevron" aria-hidden="true">
          ›
        </span>
      </div>
    </article>
  );
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", hour: "numeric", minute: "2-digit", month: "short" }).format(date);
}
