import type { PermissionService } from "../services/permissionService";
import type { CatchUpService } from "../services/catchUpService";
import type { RouteContext } from "./routeTypes";

export async function getCatchUpRoute(deps: { permissions: PermissionService; catchUp: CatchUpService }, ctx: RouteContext) {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  return deps.catchUp.buildCatchUp({ subredditId: ctx.subredditId, modId: ctx.modId, now: new Date().toISOString() });
}
