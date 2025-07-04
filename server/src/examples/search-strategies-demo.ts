/**
 * Search Strategies Demonstration Script
 * 
 * Демонстрація різних підходів до пошуку окрім векторного
 * npm run demo-search
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { HybridSearchService } from '../search/hybrid-search.service';
import { 
  LexicalSearchStrategy,
  FullTextSearchStrategy,
  BM25SearchStrategy,
  FuzzySearchStrategy,
  NGramSearchStrategy,
  RuleBasedSearchStrategy
} from '../search/search-strategies';
import { 
  GraphSearchStrategy,
  TopicSearchStrategy,
  ContextualSearchStrategy
} from '../search/advanced-strategies';
import { AppDataSource } from '../data-source';

// Load environment variables
dotenv.config();

async function demonstrateSearchStrategies() {
  console.log('\n🔍 Демонстрація альтернативних підходів до пошуку');
  console.log('=======================================================');
  
  // Initialize database connection
  try {
    await AppDataSource.initialize();
    console.log('✅ База даних підключена');
  } catch (error) {
    console.log('⚠️  База даних не підключена, використовуємо демо-режим');
  }

  const queries = [
    'як встановити Vue.js',
    'error компонент',
    'API методи',
    'style css',
    'fix bug problem'
  ];

  for (const query of queries) {
    await demonstrateQueryWithAllStrategies(query);
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

async function demonstrateQueryWithAllStrategies(query: string) {
  console.log(`📝 Запит: "${query}"`);
  console.log('-'.repeat(40));

  const strategies = [
    { name: 'Лексичний пошук', strategy: new LexicalSearchStrategy() },
    { name: 'Full-Text PostgreSQL', strategy: new FullTextSearchStrategy() },
    { name: 'BM25 алгоритм', strategy: new BM25SearchStrategy() },
    { name: 'Нечіткий пошук', strategy: new FuzzySearchStrategy() },
    { name: 'N-gram пошук', strategy: new NGramSearchStrategy() },
    { name: 'Пошук на правилах', strategy: new RuleBasedSearchStrategy() },
    { name: 'Графовий пошук', strategy: new GraphSearchStrategy() },
    { name: 'Тематичний пошук', strategy: new TopicSearchStrategy() },
    { name: 'Контекстний пошук', strategy: new ContextualSearchStrategy() }
  ];

  for (const { name, strategy } of strategies) {
    await demonstrateSingleStrategy(name, strategy, query);
  }

  // Демонстрація гібридного пошуку
  await demonstrateHybridSearch(query);
}

async function demonstrateSingleStrategy(name: string, strategy: any, query: string) {
  console.log(`\n🎯 ${name}:`);
  
  try {
    const startTime = Date.now();
    const results = await strategy.search(query, { limit: 3 });
    const executionTime = Date.now() - startTime;

    if (results.length > 0) {
      console.log(`   ✅ Знайдено ${results.length} результатів за ${executionTime}мс`);
      console.log(`   📊 Кращий результат: score=${results[0].score.toFixed(2)}, type=${results[0].matchType}`);
      
      // Показуємо деталі першого результату
      if (results[0].matchDetails) {
        const details = typeof results[0].matchDetails === 'string' 
          ? results[0].matchDetails 
          : JSON.stringify(results[0].matchDetails, null, 2);
        console.log(`   🔍 Деталі: ${details.substring(0, 100)}...`);
      }
    } else {
      console.log(`   ❌ Результатів не знайдено за ${executionTime}мс`);
    }
  } catch (error) {
    console.log(`   ⚠️  Помилка: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function demonstrateHybridSearch(query: string) {
  console.log(`\n🔥 Гібридний пошук:`);
  
  const hybridService = new HybridSearchService();

  try {
    // Автоматичні рекомендації
    const recommendedStrategies = hybridService.recommendStrategies(query);
    console.log(`   🎯 Рекомендовані стратегії: ${recommendedStrategies.join(', ')}`);

    // Різні методи комбінування
    const ensembleMethods = ['weighted_sum', 'rank_fusion', 'cascade', 'vote'];
    
    for (const method of ensembleMethods) {
      const startTime = Date.now();
      const results = await hybridService.search(query, {
        strategies: recommendedStrategies,
        ensembleMethod: method as any,
        limit: 3
      });
      const executionTime = Date.now() - startTime;

      console.log(`   📊 ${method}: ${results.length} результатів за ${executionTime}мс`);
      if (results.length > 0) {
        console.log(`      Кращий: score=${results[0].score.toFixed(2)}, стратегії=${results[0].matchDetails?.strategies?.length || 'N/A'}`);
      }
    }

  } catch (error) {
    console.log(`   ⚠️  Помилка гібридного пошуку: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function demonstrateComparison() {
  console.log('\n📈 Порівняння ефективності стратегій');
  console.log('=====================================');

  const hybridService = new HybridSearchService();
  const testQueries = [
    'error',
    'компонент',
    'API функція',
    'як налаштувати'
  ];

  for (const query of testQueries) {
    console.log(`\n🔍 Аналіз запиту: "${query}"`);
    
    try {
      const comparison = await hybridService.compareStrategies(query, { limit: 5 });
      
      console.log('Результати за стратегіями:');
      Object.entries(comparison.performance).forEach(([strategy, perf]) => {
        console.log(`  ${strategy}: ${(perf as any).count} результатів, avg score=${((perf as any).avgScore || 0).toFixed(2)}, ${(perf as any).executionTime}мс`);
      });

      // Знайти найкращу стратегію
      const best = Object.entries(comparison.performance)
        .sort(([,a], [,b]) => ((b as any).avgScore || 0) - ((a as any).avgScore || 0))[0];
      
      console.log(`  🏆 Найкраща: ${best[0]} (score: ${((best[1] as any).avgScore || 0).toFixed(2)})`);

    } catch (error) {
      console.log(`   ⚠️  Помилка порівняння: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

async function demonstrateSpecializedSearch() {
  console.log('\n🎯 Спеціалізовані типи пошуку');
  console.log('==============================');

  const hybridService = new HybridSearchService();

  // 1. Пошук для вирішення проблем
  console.log('\n🚨 Troubleshooting Search:');
  try {
    const troubleshootResults = await hybridService.search('error component not working', {
      strategies: ['rule_based', 'contextual', 'topic'],
      ensembleMethod: 'vote',
      limit: 3
    });
    console.log(`   Знайдено ${troubleshootResults.length} результатів для troubleshooting`);
  } catch (error) {
    console.log(`   ⚠️  Помилка: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // 2. Навчальний пошук
  console.log('\n📚 Learning Search:');
  try {
    const learningResults = await hybridService.search('how to create component tutorial', {
      strategies: ['contextual', 'topic', 'fulltext'],
      ensembleMethod: 'weighted_sum',
      limit: 3
    });
    console.log(`   Знайдено ${learningResults.length} результатів для навчання`);
  } catch (error) {
    console.log(`   ⚠️  Помилка: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // 3. API пошук
  console.log('\n🔌 API Search:');
  try {
    const apiResults = await hybridService.search('API methods functions interface', {
      strategies: ['topic', 'lexical', 'bm25'],
      ensembleMethod: 'rank_fusion',
      limit: 3
    });
    console.log(`   Знайдено ${apiResults.length} результатів для API`);
  } catch (error) {
    console.log(`   ⚠️  Помилка: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function showAnalytics() {
  console.log('\n📊 Аналітика пошуку');
  console.log('===================');

  const hybridService = new HybridSearchService();
  const analytics = hybridService.getAnalytics();

  console.log(`Загальна кількість пошукових запитів: ${analytics.totalSearches}`);
  
  console.log('\nПопулярні запити:');
  Object.entries(analytics.popularQueries)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([query, count]) => {
      console.log(`  "${query}": ${count} разів`);
    });

  console.log('\nПродуктивність стратегій:');
  Object.entries(analytics.strategyPerformance).forEach(([strategy, data]) => {
    console.log(`  ${strategy}: використано ${data.usage} разів, avg score=${data.avgScore.toFixed(2)}`);
  });
}

async function main() {
  console.log('🚀 Демонстрація альтернативних підходів до пошуку');
  console.log('==================================================');
  console.log('');
  console.log('📋 Доступні підходи окрім векторного:');
  console.log('1. 🔤 Лексичний пошук (Keyword/Token Search)');
  console.log('2. 📖 Full-Text Search (PostgreSQL)');
  console.log('3. 🎯 BM25 Algorithm (Best Matching)');
  console.log('4. 🌀 Fuzzy Search (Нечіткий пошук)');
  console.log('5. 🧩 N-gram Search');
  console.log('6. 📏 Rule-based Search (Правила)');
  console.log('7. 🕸️  Graph-based Search (Графовий)');
  console.log('8. 🏷️  Topic-based Search (Тематичний)');
  console.log('9. 🧠 Contextual Search (Контекстний)');
  console.log('10. 🔥 Hybrid Search (Гібридний)');

  try {
    await demonstrateSearchStrategies();
    await demonstrateComparison();
    await demonstrateSpecializedSearch();
    await showAnalytics();

    console.log('\n✅ Демонстрація завершена!');
    console.log('\n💡 Підсумок підходів:');
    console.log('• Векторний пошук - відмінний для семантичної схожості');
    console.log('• Лексичний - швидкий для точних збігів');
    console.log('• Full-text - природномовні запити');
    console.log('• BM25 - якісне ранжування');
    console.log('• Fuzzy - толерантність до помилок');
    console.log('• N-gram - часткові збіги');
    console.log('• Rule-based - контекстні правила');
    console.log('• Graph - зв\'язки між документами');
    console.log('• Topic - тематичні категорії');
    console.log('• Contextual - розуміння контексту');
    console.log('• Hybrid - комбінування переваг усіх підходів');

    console.log('\n🔧 GraphQL запити для тестування:');
    console.log(`
query HybridSearch {
  hybridSearch(
    query: "як встановити компонент"
    strategies: ["lexical", "fuzzy", "topic"]
    ensembleMethod: "weighted_sum"
  ) {
    results {
      document { title }
      score
      matchType
    }
    totalFound
    executionTimeMs
    strategiesUsed
    recommendations
  }
}

query CompareStrategies {
  compareSearchStrategies(query: "error component") {
    strategyResults {
      strategyName
      resultCount
      avgScore
      executionTimeMs
    }
    overallPerformance {
      bestStrategy
      recommendedApproach
    }
  }
}
    `);

  } catch (error) {
    console.error('\n❌ Помилка демонстрації:', error instanceof Error ? error.message : error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the demonstration
if (require.main === module) {
  main().catch(console.error);
}

export { main as runSearchStrategiesDemo }; 