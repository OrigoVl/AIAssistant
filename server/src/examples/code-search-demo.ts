import { AppDataSource } from "../data-source";
import { CodeSearchService, CODE_TECHNOLOGIES } from "../search/code-search.service";

async function demoCodeSearch() {
  // Ініціалізуємо базу даних
  await AppDataSource.initialize();
  console.log("🔌 База даних підключена");

  const codeSearchService = new CodeSearchService();

  console.log("\n🔍 ========== ДЕМОНСТРАЦІЯ КОДОВОГО ПОШУКУ ==========\n");

  // 0. Демонстрація валідації запитів
  console.log("0️⃣ Валідація запитів:");
  const testQueries = [
    "як зварити борщ?",
    "vue component lifecycle",
    "погода завтра",
    "typescript interface error",
    "де купити хліб",
    "react hooks useState",
    "a" // короткий запит
  ];

  for (const testQuery of testQueries) {
    const validation = codeSearchService.validateQuery(testQuery);
    console.log(`   "${testQuery}" -> ${validation.isTechnical ? '✅ технічний' : '❌ нетехнічний'}`);
    if (validation.warning) {
      console.log(`     ${validation.warning}`);
    }
    if (validation.suggestions && validation.suggestions.length > 0) {
      console.log(`     Поради: ${validation.suggestions.join('; ')}`);
    }
  }

  // 1. Демонстрація обробки короткого запиту
  console.log("\n1️⃣ Обробка короткого запиту:");
  const shortQueryResult = await codeSearchService.searchCode("a");
  console.log(`   Запит: "a"`);
  console.log(`   Технічний: ${shortQueryResult.isTechnical}`);
  console.log(`   Результатів: ${shortQueryResult.results.length}`);
  if (shortQueryResult.warning) {
    console.log(`   Попередження: ${shortQueryResult.warning}`);
  }

  // 2. Базовий пошук по всіх кодових технологіях
  console.log("\n2️⃣ Загальний пошук по коду:");
  const generalResults = await codeSearchService.searchCode("component lifecycle", {
    limit: 5
  });
  console.log(`   Знайдено ${generalResults.results.length} результатів:`);
  generalResults.results.forEach((result, index) => {
    console.log(`   ${index + 1}. [${result.document.technology}] ${result.document.title} (score: ${result.score.toFixed(2)})`);
  });

  // 3. Пошук тільки по Vue.js
  console.log("\n3️⃣ Пошук тільки по Vue.js:");
  const vueResults = await codeSearchService.searchByTechnology(
    CODE_TECHNOLOGIES.VUE, 
    "computed properties", 
    { limit: 3 }
  );
  console.log(`   Знайдено ${vueResults.results.length} результатів:`);
  vueResults.results.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.document.title} (score: ${result.score.toFixed(2)})`);
  });

  // 4. Пошук тільки документації
  console.log("\n4️⃣ Пошук тільки в документації:");
  const docsResults = await codeSearchService.searchCodeDocumentation("async await", {
    technologies: [CODE_TECHNOLOGIES.NODE, CODE_TECHNOLOGIES.TYPESCRIPT],
    limit: 3
  });
  console.log(`   Знайдено ${docsResults.results.length} результатів:`);
  docsResults.results.forEach((result, index) => {
    console.log(`   ${index + 1}. [${result.document.technology}] ${result.document.title}`);
  });

  // 5. Пошук проблем/issues
  console.log("\n5️⃣ Пошук проблем та issues:");
  const issuesResults = await codeSearchService.searchCodeIssues("memory leak error", {
    technologies: [CODE_TECHNOLOGIES.NODE],
    limit: 3
  });
  console.log(`   Знайдено ${issuesResults.results.length} результатів:`);
  issuesResults.results.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.document.title} (type: ${result.document.type})`);
  });

  // 6. Пошук API
  console.log("\n6️⃣ Пошук API документації:");
  const apiResults = await codeSearchService.searchAPI("render function", {
    technologies: [CODE_TECHNOLOGIES.VUE],
    limit: 3
  });
  console.log(`   Знайдено ${apiResults.results.length} результатів:`);
  apiResults.results.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.document.title} (match: ${result.matchType})`);
  });

  // 7. Troubleshooting пошук
  console.log("\n7️⃣ Troubleshooting пошук:");
  const troubleshootResults = await codeSearchService.searchTroubleshooting("typescript compilation error", {
    technologies: [CODE_TECHNOLOGIES.TYPESCRIPT],
    limit: 3
  });
  console.log(`   Знайдено ${troubleshootResults.results.length} результатів:`);
  troubleshootResults.results.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.document.title} (score: ${result.score.toFixed(2)})`);
  });

  // 8. Демонстрація підтримуваних технологій
  console.log("\n8️⃣ Підтримувані технології:");
  const technologies = codeSearchService.getCodeTechnologies();
  technologies.forEach(tech => {
    console.log(`   🔹 ${tech.label} (${tech.value}) - ${tech.description}`);
  });

  // 9. Рекомендації для запитів
  console.log("\n9️⃣ Рекомендації для різних запитів:");
  const recommendationQueries = [
    "err",
    "component state management in vue",
    "typescript interfaces and generics"
  ];

  for (const query of recommendationQueries) {
    const recommendations = codeSearchService.getCodeSearchRecommendations(query);
    console.log(`   Query: "${query}"`);
    console.log(`   Рекомендації: ${recommendations.join(", ") || "Немає рекомендацій"}`);
  }

  // 9. Порівняння стратегій для кодового пошуку
  console.log("\n9️⃣ Оптимальні стратегії для різних запитів:");
  const queryTests = [
    "api",
    "vue component error handling with try catch",
    "node server setup"
  ];

  for (const query of queryTests) {
    const strategies = codeSearchService.getCodeOptimizedStrategies(query);
    console.log(`   "${query}" -> стратегії: ${strategies.join(", ")}`);
  }

  console.log("\n✅ Демонстрація завершена!");
  await AppDataSource.destroy();
}

// Запуск демонстрації
if (require.main === module) {
  demoCodeSearch().catch(error => {
    console.error("❌ Помилка в демонстрації:", error);
    process.exit(1);
  });
}

export { demoCodeSearch }; 