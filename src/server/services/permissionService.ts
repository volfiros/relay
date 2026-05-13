export interface ModeratorLookup {
  isModerator(subredditName: string, userId: string): Promise<boolean>;
}

export class PermissionService {
  constructor(private readonly lookup: ModeratorLookup) {}

  async assertModeratorAccess(subredditName: string, userId: string): Promise<void> {
    const isModerator = await this.lookup.isModerator(subredditName, userId);
    if (!isModerator) {
      throw new Error("Permission denied");
    }
  }
}
