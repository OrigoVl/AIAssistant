import { Octokit } from '@octokit/rest';
import { Document } from "../../entities/document.entity";

export async function parseGitHubRepoIssues(
  owner: string, 
  repo: string, 
  technology: string
): Promise<Partial<Document>[]> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const issues: Partial<Document>[] = [];
  
  const iterator = octokit.paginate.iterator(octokit.issues.listForRepo, {
    owner,
    repo,
    state: 'all',
    per_page: 100
  });
  
  for await (const { data } of iterator) {
    for (const issue of data) {
      issues.push({
        title: issue.title,
        content: issue.body || '',
        source: issue.html_url,
        type: 'issue',
        technology
      });
    }
  }
  
  return issues;
}