import type { PermissionService } from "../services/permissionService";
import type { RelaySettings, SettingsService } from "../services/settingsService";
import type { RouteContext } from "./routeTypes";

export async function getSettingsRoute(
  deps: { permissions: PermissionService; settings: SettingsService },
  ctx: RouteContext,
): Promise<RelaySettings> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  return deps.settings.getSettings(ctx.subredditId);
}

export async function updateSettingsRoute(
  deps: { permissions: PermissionService; settings: SettingsService },
  ctx: RouteContext,
  patch: Partial<RelaySettings>,
): Promise<RelaySettings> {
  await deps.permissions.assertModeratorAccess(ctx.subredditName, ctx.modId);
  return deps.settings.updateSettings(ctx.subredditId, patch);
}
