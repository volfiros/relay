import { StatusBadge } from "./StatusBadge";
import { routes } from "../routes";
import type { BoardCaseDto } from "../../server/services/boardService";

export function BoardCaseRow({ item }: { item: BoardCaseDto }) {
  return (
    <article className="item-row">
      <a className="item-title" href={routes.caseDetail(item.id)}>
        {item.title}
      </a>
      <div className="meta">
        <StatusBadge value={item.status} />
        <StatusBadge value={item.urgency} />
        <span>{item.category}</span>
        <span>{item.ownerModId}</span>
      </div>
    </article>
  );
}
