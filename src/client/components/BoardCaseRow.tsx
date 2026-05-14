import { Link } from "@tanstack/react-router";
import { StatusBadge } from "./StatusBadge";
import type { BoardCaseDto } from "../../server/services/boardService";

export function BoardCaseRow({ item }: { item: BoardCaseDto }) {
  return (
    <article className="item-row">
      <Link className="item-title" params={{ caseId: item.id }} to="/cases/$caseId">
        {item.title}
      </Link>
      <div className="meta">
        <StatusBadge value={item.status} />
        <StatusBadge value={item.urgency} />
        <span>{item.category}</span>
        <span>{item.ownerModId}</span>
      </div>
    </article>
  );
}
