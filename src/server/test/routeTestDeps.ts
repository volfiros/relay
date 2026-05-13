import { CaseEventRepository } from "../repositories/caseEventRepository";
import { CaseRepository } from "../repositories/caseRepository";
import { FollowUpRepository } from "../repositories/followupRepository";
import { HandoffRepository } from "../repositories/handoffRepository";
import { ModeratorStateRepository } from "../repositories/moderatorStateRepository";
import { ReviewRepository } from "../repositories/reviewRepository";
import { AuditService } from "../services/auditService";
import { CatchUpService } from "../services/catchUpService";
import { DuplicateCaseService } from "../services/duplicateCaseService";
import { PermissionService } from "../services/permissionService";
import { RedditContextService, type RedditContextAdapter } from "../services/redditContextService";
import { SettingsService } from "../services/settingsService";
import { InMemoryRedis } from "./inMemoryRedis";

export function makeRouteTestDeps(adapter: RedditContextAdapter = { async getTarget() { return {}; } }) {
  const redis = new InMemoryRedis();
  const cases = new CaseRepository(redis);
  const handoffs = new HandoffRepository(redis);
  const reviews = new ReviewRepository(redis);
  const followUps = new FollowUpRepository(redis);
  const moderatorStates = new ModeratorStateRepository(redis);
  const events = new CaseEventRepository(redis);
  const audit = new AuditService(events);
  const permissions = new PermissionService({ async isModerator() { return true; } });
  return {
    redis,
    cases,
    handoffs,
    reviews,
    followUps,
    moderatorStates,
    events,
    audit,
    permissions,
    catchUp: new CatchUpService(cases, handoffs, reviews, followUps, moderatorStates),
    duplicates: new DuplicateCaseService(cases),
    redditContext: new RedditContextService(adapter),
    settings: new SettingsService(redis),
  };
}

export const routeContext = {
  subredditId: "sub1",
  subredditName: "RelayTest",
  modId: "mod_a",
};
