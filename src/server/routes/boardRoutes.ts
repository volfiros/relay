import type { BoardFilters, BoardService, RelayBoardDto } from "../services/boardService";
import type { PermissionService } from "../services/permissionService";
import type { RouteContext } from "./routeTypes";

export async function getBoardRoute(
  deps: { permissions: PermissionService; board: BoardService },
  ctx: RouteContext,
  filters: BoardFilters = {},
): Promise<RelayBoardDto> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  return deps.board.buildBoard({ subredditId: ctx.subredditId, now: new Date().toISOString(), filters });
}
