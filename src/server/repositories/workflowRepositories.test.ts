import { describe, expect, it } from "bun:test";
import { FollowUpRepository } from "./followupRepository";
import { HandoffRepository } from "./handoffRepository";
import { ModeratorStateRepository } from "./moderatorStateRepository";
import { ReviewRepository } from "./reviewRepository";
import { InMemoryRedis } from "../test/inMemoryRedis";
import { makeFollowUp, makeHandoff, makeModeratorState, makeReview } from "../test/fixtures";

describe("workflow repositories", () => {
  it("indexes handoffs by recipient and unassigned state", async () => {
    const repository = new HandoffRepository(new InMemoryRedis());

    await repository.save(makeHandoff({ id: "handoff_to_b", toModId: "mod_b" }));
    await repository.save(makeHandoff({ id: "handoff_any", toModId: null, toAnyAvailableMod: true }));

    await expect(repository.listHandoffIdsForRecipient("sub1", "mod_b")).resolves.toEqual(["handoff_to_b"]);
    await expect(repository.listUnassignedHandoffIds("sub1")).resolves.toEqual(["handoff_any"]);
  });

  it("indexes reviews by reviewer and unassigned state", async () => {
    const repository = new ReviewRepository(new InMemoryRedis());

    await repository.save(makeReview({ id: "review_to_b", requestedReviewerModId: "mod_b" }));
    await repository.save(makeReview({ id: "review_any", requestedReviewerModId: null, anyReviewer: true }));

    await expect(repository.listReviewIdsForReviewer("sub1", "mod_b")).resolves.toEqual(["review_to_b"]);
    await expect(repository.listUnassignedReviewIds("sub1")).resolves.toEqual(["review_any"]);
  });

  it("indexes follow-ups by owner", async () => {
    const repository = new FollowUpRepository(new InMemoryRedis());

    await repository.save(makeFollowUp({ id: "followup_a", ownerModId: "mod_a" }));

    await expect(repository.listFollowUpIdsForOwner("sub1", "mod_a")).resolves.toEqual(["followup_a"]);
  });

  it("stores moderator state", async () => {
    const repository = new ModeratorStateRepository(new InMemoryRedis());
    const state = makeModeratorState({ lastCatchUpSeenAt: "2026-05-13T01:00:00.000Z" });

    await repository.save(state);

    await expect(repository.get("sub1", "mod_a")).resolves.toEqual(state);
  });
});
