import type { ReviewRequest } from "../domain/types";
import { keys } from "./keys";
import type { RelayRedis } from "./redisTypes";

export class ReviewRepository {
  constructor(private readonly redis: RelayRedis) {}

  async save(review: ReviewRequest): Promise<void> {
    await this.redis.set(keys.review(review.subredditId, review.id), JSON.stringify(review));
    const score = Date.parse(review.updatedAt);
    if (review.requestedReviewerModId) {
      await this.redis.zAdd(keys.reviewsByReviewer(review.subredditId, review.requestedReviewerModId), [
        { score, member: review.id },
      ]);
    }
    if (review.anyReviewer) {
      await this.redis.zAdd(keys.reviewsUnassigned(review.subredditId), [{ score, member: review.id }]);
    }
  }

  async get(subredditId: string, reviewId: string): Promise<ReviewRequest | null> {
    const value = await this.redis.get(keys.review(subredditId, reviewId));
    return value ? (JSON.parse(value) as ReviewRequest) : null;
  }

  async listReviewIdsForReviewer(subredditId: string, modId: string): Promise<string[]> {
    return this.redis.zRange(keys.reviewsByReviewer(subredditId, modId), 0, -1);
  }

  async listUnassignedReviewIds(subredditId: string): Promise<string[]> {
    return this.redis.zRange(keys.reviewsUnassigned(subredditId), 0, -1);
  }
}
