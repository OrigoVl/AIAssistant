import { Octokit } from "@octokit/rest";
import { Document } from "../entities/document.entity";
import { AppDataSource } from "../data-source";
import axios from "axios";
import { load } from "cheerio";

// Завантаження документації з офіційних сайтів
async function loadOfficialDocs() {
  const docs = [
    { name: "vue", url: "https://vuejs.org/api/" },
    { name: "node", url: "https://nodejs.org/api/documentation.html" },
    { name: "typescript", url: "https://www.typescriptlang.org/docs/" },
    { name: "grapesjs", url: "https://grapesjs.com/docs/" },
  ];

  const docRepository = AppDataSource.getRepository(Document);

  for (const doc of docs) {
    const { data } = await axios.get(doc.url);
    const $ = load(data);
    const content = $("body").text().substring(0, 10000); // Обмеження контенту

    const docEntity = new Document();
    docEntity.title = `${doc.name} Documentation`;
    docEntity.content = content;
    docEntity.source = `official:${doc.url}`;

    await docRepository.save(docEntity);
  }
}

// Завантаження GitHub Issues
async function loadGitHubIssues() {
  const repos = [
    { owner: "vuejs", repo: "core" },
    { owner: "nodejs", repo: "node" },
    { owner: "microsoft", repo: "TypeScript" },
    { owner: "GrapesJS", repo: "grapesjs" },
  ];

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const docRepository = AppDataSource.getRepository(Document);

  for (const { owner, repo } of repos) {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "all",
      per_page: 100,
    });

    for (const issue of data) {
      const issueEntity = new Document();
      issueEntity.title = issue.title;
      issueEntity.content = issue.body || "";
      issueEntity.source = `github:${owner}/${repo}/issues/${issue.number}`;

      await docRepository.save(issueEntity);
    }
  }
}

// Запуск процесу завантаження
export async function loadAllData() {
  await loadOfficialDocs();
  await loadGitHubIssues();
}
