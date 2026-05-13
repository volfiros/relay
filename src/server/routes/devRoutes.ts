import type { DemoSeedRepositories, DemoSeedResult } from "../dev/seedDemoData";
import { seedDemoData } from "../dev/seedDemoData";

export function assertDemoRoutesEnabled(): void {
  if (process.env.RELAY_DEMO_ROUTES !== "enabled") {
    throw new Error("Demo routes disabled");
  }
}

export async function seedDemoRoute(repositories: DemoSeedRepositories): Promise<DemoSeedResult> {
  assertDemoRoutesEnabled();
  return seedDemoData(repositories);
}

export async function resetDemoRoute(repositories: DemoSeedRepositories): Promise<DemoSeedResult> {
  assertDemoRoutesEnabled();
  return seedDemoData(repositories);
}
