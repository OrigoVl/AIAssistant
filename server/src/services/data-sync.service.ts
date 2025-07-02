import { AppDataSource } from "../data-source";
import { Document } from "../entities/document.entity";
import { parseVueDocumentation } from "../ai/parsers/web-parser";
import { parseGitHubRepoIssues } from "../ai/parsers/github-parser";
import { populateVectorStore } from "../ai/vector-store";

const TECHS = [
  {
    name: "vue",
    docs: "https://vuejs.org/api/",
    repo: { owner: "vuejs", repo: "core" },
  },
  {
    name: "node",
    docs: "https://nodejs.org/api/",
    repo: { owner: "nodejs", repo: "node" },
  },
  {
    name: "typescript",
    docs: "https://www.typescriptlang.org/docs/",
    repo: { owner: "microsoft", repo: "TypeScript" },
  },
  {
    name: "grapesjs",
    docs: "https://grapesjs.com/docs/",
    repo: { owner: "GrapesJS", repo: "grapesjs" },
  },
];

export async function syncAllData() {
  const docRepo = AppDataSource.getRepository(Document);

  for (const tech of TECHS) {
    // Оновлення документації
    const docs = await parseVueDocumentation(); // Замінити на відповідний парсер
    for (const doc of docs) {
      await docRepo.upsert(
        {
          ...doc,
          technology: tech.name,
        },
        ["source"]
      );
    }

    // Оновлення GitHub Issues
    const issues = await parseGitHubRepoIssues(
      tech.repo.owner,
      tech.repo.repo,
      tech.name
    );

    for (const issue of issues) {
      await docRepo.upsert(
        {
          ...issue,
          technology: tech.name,
        },
        ["source"]
      );
    }
  }

  // Оновлення векторного сховища
  await populateVectorStore();
}

// Запуск при старті сервера
AppDataSource.initialize().then(syncAllData);
