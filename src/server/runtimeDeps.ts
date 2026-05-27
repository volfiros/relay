import { context as devvitContext } from "@devvit/server";
import { DEMO_PRIMARY_MOD_ID, DEMO_SUBREDDIT_ID, DEMO_SUBREDDIT_NAME } from "./dev/seedDemoData";
import { CaseEventRepository } from "./repositories/caseEventRepository";
import { CaseRepository } from "./repositories/caseRepository";
import { FollowUpRepository } from "./repositories/followupRepository";
import { HandoffRepository } from "./repositories/handoffRepository";
import { InMemoryRedis } from "./repositories/inMemoryRedis";
import { ModeratorStateRepository } from "./repositories/moderatorStateRepository";
import { ReviewRepository } from "./repositories/reviewRepository";
import type { RouteContext } from "./routes/routeTypes";
import { AuditService } from "./services/auditService";
import { BoardService } from "./services/boardService";
import { CatchUpService } from "./services/catchUpService";
import { DuplicateCaseService } from "./services/duplicateCaseService";
import { PermissionService } from "./services/permissionService";
import { RedditContextService } from "./services/redditContextService";
import { SettingsService } from "./services/settingsService";

const redis = new InMemoryRedis();
const cases = new CaseRepository(redis);
const handoffs = new HandoffRepository(redis);
const reviews = new ReviewRepository(redis);
const followUps = new FollowUpRepository(redis);
const moderatorStates = new ModeratorStateRepository(redis);
const events = new CaseEventRepository(redis);
const audit = new AuditService(events);

export const runtimeDeps = {
  redis,
  cases,
  handoffs,
  reviews,
  followUps,
  moderatorStates,
  events,
  audit,
  permissions: new PermissionService({ async isModerator() { return true; } }),
  board: new BoardService(cases, reviews, handoffs, followUps),
  catchUp: new CatchUpService(cases, handoffs, reviews, followUps, moderatorStates),
  duplicates: new DuplicateCaseService(cases),
  redditContext: new RedditContextService({
    async getTarget(input) {
      return {
        targetPermalink: `https://reddit.com/r/${DEMO_SUBREDDIT_NAME}/comments/${input.targetId}`,
        targetSummary: `Relay context for ${input.targetType} ${input.targetId}`,
      };
    },
  }),
  settings: new SettingsService(redis),
};

export function getRuntimeRouteContext(): RouteContext {
  return {
    subredditId: getDevvitContextValue("subredditId") ?? DEMO_SUBREDDIT_ID,
    subredditName: getDevvitContextValue("subredditName") ?? DEMO_SUBREDDIT_NAME,
    modId: getDevvitContextValue("userId") ?? DEMO_PRIMARY_MOD_ID,
  };
}

function getDevvitContextValue(key: "subredditId" | "subredditName" | "userId"): string | undefined {
  try {
    return devvitContext[key] ?? undefined;
  } catch {
    return undefined;
  }
}
