import type { TargetType } from "../domain/types";

export interface RedditTargetContext {
  targetPermalink: string;
  targetSummary: string;
  targetAuthor: string | null;
  parentContext: string | null;
  threadContext: string | null;
  authorContext: string | null;
  reportContext: string | null;
  missingContextFlags: string[];
}

export interface RedditContextAdapter {
  getTarget(input: { targetType: "post" | "comment"; targetId: string }): Promise<Partial<RedditTargetContext>>;
}

export class RedditContextService {
  constructor(private readonly adapter: RedditContextAdapter) {}

  async getContext(input: { targetType: TargetType; targetId: string }): Promise<RedditTargetContext> {
    if (input.targetType !== "post" && input.targetType !== "comment") {
      throw new Error("Unsupported target type");
    }

    const context = await this.adapter.getTarget({ targetType: input.targetType, targetId: input.targetId });
    const missingContextFlags = new Set(context.missingContextFlags ?? []);

    if (!context.parentContext && input.targetType === "comment") missingContextFlags.add("parent_context_unavailable");
    if (!context.threadContext) missingContextFlags.add("thread_context_unavailable");
    if (!context.authorContext) missingContextFlags.add("author_context_unavailable");
    if (!context.reportContext) missingContextFlags.add("report_context_unavailable");

    return {
      targetPermalink: context.targetPermalink ?? "",
      targetSummary: context.targetSummary ?? "Target context unavailable",
      targetAuthor: context.targetAuthor ?? null,
      parentContext: context.parentContext ?? null,
      threadContext: context.threadContext ?? null,
      authorContext: context.authorContext ?? null,
      reportContext: context.reportContext ?? null,
      missingContextFlags: [...missingContextFlags],
    };
  }
}
