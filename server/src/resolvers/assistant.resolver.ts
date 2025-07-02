import { Query, Resolver, Arg, Int, Ctx } from "type-graphql";
import { Document } from "../entities/document.entity";
import { GitHubIssue } from "../types/github-issue.type";
import { GitHubService } from "../services/github.service";
import { SearchResult } from "../types/search-result.type";
import { AppDataSource } from "../data-source";

interface Context {
  req: any;
  databaseConnected: boolean;
}

@Resolver()
export class AssistantResolver {
  private githubService = new GitHubService();
  private readonly docRepository = AppDataSource.getRepository(Document);

  @Query(() => SearchResult)
  async searchDocuments(
    @Arg("query") query: string,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit: number,
    @Arg("offset", () => Int, { defaultValue: 0 }) offset: number,
    @Arg("sortBy", { nullable: true }) sortBy?: string
  ): Promise<SearchResult> {
    // Базовий запит з фільтрацією
    const queryBuilder = this.docRepository
      .createQueryBuilder("doc")
      .where("doc.title ILIKE :query OR doc.content ILIKE :query", {
        query: `%${query}%`,
      });

    // Сортування
    if (sortBy === "newest") {
      queryBuilder.orderBy("doc.created_at", "DESC");
    } else {
      // Сортування за релевантністю (за замовчуванням)
      queryBuilder.orderBy("doc.created_at", "DESC");
    }

    // Пагінація та виконання запиту
    const [items, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return new SearchResult(items, total);
  }

  @Query(() => GitHubIssue, { nullable: true })
  async getGitHubIssue(
    @Arg("issueId") issueId: string
  ): Promise<GitHubIssue | null> {
    // Логіка запиту до GitHub API
    // For now, returning a mock response
    return {
      id: issueId,
      title: "Sample Issue",
      body: "This is a sample GitHub issue",
      state: "open",
      url: `https://github.com/user/repo/issues/${issueId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: undefined,
      labels: ["bug", "high-priority"],
    };
  }

  @Query(() => [GitHubIssue])
  async searchGitHubIssues(
    @Arg("repo") repo: string,
    @Arg("query") query: string,
    @Arg("limit", { nullable: true }) limit: number = 10
  ) {
    return this.githubService.searchIssues(repo, query, limit);
  }

  @Query(() => String)
  async healthCheck(@Ctx() context: Context): Promise<string> {
    const dbStatus = context.databaseConnected ? "connected" : "disconnected";
    return `AI Assistant API is running! Database: ${dbStatus}`;
  }
}
