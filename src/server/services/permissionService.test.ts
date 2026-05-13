import { describe, expect, it } from "bun:test";
import { PermissionService } from "./permissionService";

describe("PermissionService", () => {
  it("allows moderators", async () => {
    const service = new PermissionService({
      async isModerator() {
        return true;
      },
    });

    await expect(service.assertModeratorAccess("RelayTest", "mod_a")).resolves.toBeUndefined();
  });

  it("rejects non-moderators", async () => {
    const service = new PermissionService({
      async isModerator() {
        return false;
      },
    });

    await expect(service.assertModeratorAccess("RelayTest", "user_a")).rejects.toThrow("Permission denied");
  });
});
