import { Octokit } from "@octokit/rest";
import "dotenv/config";

export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async searchIssues(repo: string, query: string, limit: number) {
    const [owner, repoName] = repo.split("/");

    const { data } = await this.octokit.search.issuesAndPullRequests({
      q: `${query} repo:${owner}/${repoName} is:issue`,
      per_page: limit,
      sort: "updated",
      order: "desc",
    });

    return data.items.map((item) => ({
      id: item.id.toString(),
      title: item.title,
      body: item.body || "",
      url: item.html_url,
      state: item.state,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }
}
