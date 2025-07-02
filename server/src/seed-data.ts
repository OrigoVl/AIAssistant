import { AppDataSource } from "./data-source";
import { Document } from "./entities/document.entity";
import { format } from "date-fns";

async function seedDatabase() {
  await AppDataSource.initialize();

  const docRepository = AppDataSource.getRepository(Document);

  const documents = [
    {
      title: "Vue Composition API",
      content:
        "Composition API дозволяє організувати логіку компонента за функціональностями",
      source: "vue",
      type: "documentation",
      technology: "vue",
      createdAt: new Date(),
    },
    {
      title: "Node.js Event Loop",
      content:
        "Event Loop - це механізм, який дозволяє Node.js виконувати неблокуючі операції",
      source: "node",
      type: "documentation",
      technology: "node",
    },
    {
      title: "TypeScript Generics",
      content:
        "Generics дозволяють створювати компоненти, що працюють з різними типами даних",
      source: "typescript",
      type: "documentation",
      technology: "typescript",
    },
  ];

  await docRepository.save(documents);
}

seedDatabase().catch((err) => console.error(err));
