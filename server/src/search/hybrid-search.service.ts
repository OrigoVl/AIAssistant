import { 
  SearchStrategy, 
  SearchResult, 
  SearchOptions,
  LexicalSearchStrategy,
  FullTextSearchStrategy,
  BM25SearchStrategy,
  FuzzySearchStrategy,
  NGramSearchStrategy,
  RuleBasedSearchStrategy
} from "./search-strategies";

export interface HybridSearchOptions extends SearchOptions {
  strategies?: string[];
  weights?: Record<string, number>;
  ensembleMethod?: 'weighted_sum' | 'rank_fusion' | 'cascade' | 'vote';
  vectorSearch?: boolean;
}

export interface SearchAnalytics {
  totalSearches: number;
  strategyPerformance: Record<string, { usage: number, avgScore: number }>;
  popularQueries: Record<string, number>;
}

export class HybridSearchService {
  private strategies: Map<string, SearchStrategy> = new Map();
  private analytics: SearchAnalytics = {
    totalSearches: 0,
    strategyPerformance: {},
    popularQueries: {}
  };

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    const strategies = [
      new LexicalSearchStrategy(),
      new FullTextSearchStrategy(),
      new BM25SearchStrategy(),
      new FuzzySearchStrategy(),
      new NGramSearchStrategy(),
      new RuleBasedSearchStrategy()
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
      this.analytics.strategyPerformance[strategy.name] = { usage: 0, avgScore: 0 };
    });
  }

  // Main hybrid search method
  async search(query: string, options: HybridSearchOptions = {}): Promise<SearchResult[]> {
    const startTime = Date.now();
    this.updateAnalytics(query);

    const {
      strategies: requestedStrategies = ['lexical', 'fulltext'],
      weights = this.getDefaultWeights(),
      ensembleMethod = 'weighted_sum',
      limit = 10
    } = options;

    console.log(`🔍 Hybrid Search: "${query}" using strategies: ${requestedStrategies.join(', ')}`);

    // Виконання пошуку з різними стратегіями
    const strategyResults = await Promise.all(
      requestedStrategies.map(async (strategyName) => {
        const strategy = this.strategies.get(strategyName);
        if (!strategy) {
          console.warn(`Unknown strategy: ${strategyName}`);
          return { strategy: strategyName, results: [] };
        }

        try {
          const results = await strategy.search(query, options);
          this.updateStrategyPerformance(strategyName, results);
          return { strategy: strategyName, results };
        } catch (error) {
          console.error(`Error in ${strategyName} strategy:`, error);
          return { strategy: strategyName, results: [] };
        }
      })
    );

    // Комбінування результатів
    const combinedResults = this.combineResults(strategyResults, weights, ensembleMethod);
    const finalResults = combinedResults.slice(0, limit);

    const executionTime = Date.now() - startTime;
    console.log(`✅ Search completed in ${executionTime}ms, found ${finalResults.length} results`);

    return finalResults;
  }

  // Комбінування результатів з різних стратегій
  private combineResults(
    strategyResults: Array<{ strategy: string, results: SearchResult[] }>,
    weights: Record<string, number>,
    method: string
  ): SearchResult[] {
    switch (method) {
      case 'weighted_sum':
        return this.weightedSumFusion(strategyResults, weights);
      case 'rank_fusion':
        return this.rankFusion(strategyResults);
      case 'cascade':
        return this.cascadeFusion(strategyResults);
      case 'vote':
        return this.voteFusion(strategyResults);
      default:
        return this.weightedSumFusion(strategyResults, weights);
    }
  }

  // Зважена сума результатів
  private weightedSumFusion(
    strategyResults: Array<{ strategy: string, results: SearchResult[] }>,
    weights: Record<string, number>
  ): SearchResult[] {
    const documentScores = new Map<number, {
      document: any,
      totalScore: number,
      strategies: string[],
      details: any[]
    }>();

    for (const { strategy, results } of strategyResults) {
      const weight = weights[strategy] || 1.0;
      
      for (const result of results) {
        const docId = result.document.id;
        const weightedScore = result.score * weight;
        
        if (documentScores.has(docId)) {
          const existing = documentScores.get(docId)!;
          existing.totalScore += weightedScore;
          existing.strategies.push(strategy);
          existing.details.push({
            strategy,
            score: result.score,
            matchType: result.matchType,
            matchDetails: result.matchDetails
          });
        } else {
          documentScores.set(docId, {
            document: result.document,
            totalScore: weightedScore,
            strategies: [strategy],
            details: [{
              strategy,
              score: result.score,
              matchType: result.matchType,
              matchDetails: result.matchDetails
            }]
          });
        }
      }
    }

    return Array.from(documentScores.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .map(item => ({
        document: item.document,
        score: item.totalScore,
        matchType: 'hybrid_weighted',
        matchDetails: {
          strategies: item.strategies,
          details: item.details,
          combinedStrategies: item.strategies.length
        }
      }));
  }

  // Ранжування на основі позицій
  private rankFusion(
    strategyResults: Array<{ strategy: string, results: SearchResult[] }>
  ): SearchResult[] {
    const documentRanks = new Map<number, {
      document: any,
      totalRank: number,
      strategies: string[]
    }>();

    for (const { strategy, results } of strategyResults) {
      results.forEach((result, index) => {
        const docId = result.document.id;
        const rank = 1 / (index + 1); // Обернений ранг
        
        if (documentRanks.has(docId)) {
          const existing = documentRanks.get(docId)!;
          existing.totalRank += rank;
          existing.strategies.push(strategy);
        } else {
          documentRanks.set(docId, {
            document: result.document,
            totalRank: rank,
            strategies: [strategy]
          });
        }
      });
    }

    return Array.from(documentRanks.values())
      .sort((a, b) => b.totalRank - a.totalRank)
      .map(item => ({
        document: item.document,
        score: item.totalRank,
        matchType: 'hybrid_rank_fusion',
        matchDetails: {
          strategies: item.strategies,
          rankScore: item.totalRank
        }
      }));
  }

  // Каскадний пошук (використовуємо наступну стратегію якщо попередня не дала результатів)
  private cascadeFusion(
    strategyResults: Array<{ strategy: string, results: SearchResult[] }>
  ): SearchResult[] {
    for (const { strategy, results } of strategyResults) {
      if (results.length > 0) {
        console.log(`Cascade: Using results from ${strategy} strategy`);
        return results.map(result => ({
          ...result,
          matchType: `cascade_${result.matchType}`,
          matchDetails: {
            ...result.matchDetails,
            cascadeStrategy: strategy
          }
        }));
      }
    }
    return [];
  }

  // Голосування (документ повинен з'явитись в результатах кількох стратегій)
  private voteFusion(
    strategyResults: Array<{ strategy: string, results: SearchResult[] }>
  ): SearchResult[] {
    const documentVotes = new Map<number, {
      document: any,
      votes: number,
      avgScore: number,
      strategies: string[]
    }>();

    for (const { strategy, results } of strategyResults) {
      for (const result of results) {
        const docId = result.document.id;
        
        if (documentVotes.has(docId)) {
          const existing = documentVotes.get(docId)!;
          existing.votes++;
          existing.avgScore = (existing.avgScore + result.score) / 2;
          existing.strategies.push(strategy);
        } else {
          documentVotes.set(docId, {
            document: result.document,
            votes: 1,
            avgScore: result.score,
            strategies: [strategy]
          });
        }
      }
    }

    // Фільтруємо документи з мінімум 2 голосами
    return Array.from(documentVotes.values())
      .filter(item => item.votes >= 2)
      .sort((a, b) => {
        if (b.votes !== a.votes) return b.votes - a.votes;
        return b.avgScore - a.avgScore;
      })
      .map(item => ({
        document: item.document,
        score: item.avgScore,
        matchType: 'hybrid_vote',
        matchDetails: {
          votes: item.votes,
          strategies: item.strategies,
          avgScore: item.avgScore
        }
      }));
  }

  // Пошук лише з однією стратегією
  async searchWithStrategy(
    strategyName: string, 
    query: string, 
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Strategy "${strategyName}" not found`);
    }

    console.log(`🎯 Single Strategy Search: "${query}" using ${strategyName}`);
    const results = await strategy.search(query, options);
    this.updateStrategyPerformance(strategyName, results);
    
    return results;
  }

  // Порівняння стратегій
  async compareStrategies(query: string, options: SearchOptions = {}): Promise<{
    query: string,
    results: Record<string, SearchResult[]>,
    performance: Record<string, { count: number, avgScore: number, executionTime: number }>
  }> {
    const results: Record<string, SearchResult[]> = {};
    const performance: Record<string, { count: number, avgScore: number, executionTime: number }> = {};

    for (const [name, strategy] of this.strategies) {
      const startTime = Date.now();
      
      try {
        const strategyResults = await strategy.search(query, options);
        const executionTime = Date.now() - startTime;
        
        results[name] = strategyResults;
        performance[name] = {
          count: strategyResults.length,
          avgScore: strategyResults.reduce((sum, r) => sum + r.score, 0) / strategyResults.length || 0,
          executionTime
        };
      } catch (error) {
        console.error(`Error comparing strategy ${name}:`, error);
        results[name] = [];
        performance[name] = { count: 0, avgScore: 0, executionTime: 0 };
      }
    }

    return { query, results, performance };
  }

  // Отримання інформації про доступні стратегії
  getAvailableStrategies(): Array<{ name: string, description: string }> {
    return Array.from(this.strategies.values()).map(strategy => ({
      name: strategy.name,
      description: strategy.description
    }));
  }

  // Рекомендації стратегій на основі запиту
  recommendStrategies(query: string): string[] {
    const recommendations: string[] = [];

    // Короткі запити - fuzzy search
    if (query.length < 10) {
      recommendations.push('fuzzy', 'ngram');
    }

    // Довгі запити - full-text search
    if (query.length > 20) {
      recommendations.push('fulltext', 'bm25');
    }

    // Технічні терміни - lexical search
    if (/\b(error|bug|issue|problem)\b/i.test(query)) {
      recommendations.push('rule_based', 'lexical');
    }

    // За замовчуванням
    if (recommendations.length === 0) {
      recommendations.push('lexical', 'fulltext');
    }

    return [...new Set(recommendations)]; // Унікальні рекомендації
  }

  // Аналітика
  getAnalytics(): SearchAnalytics {
    return { ...this.analytics };
  }

  private updateAnalytics(query: string): void {
    this.analytics.totalSearches++;
    this.analytics.popularQueries[query] = (this.analytics.popularQueries[query] || 0) + 1;
  }

  private updateStrategyPerformance(strategyName: string, results: SearchResult[]): void {
    const performance = this.analytics.strategyPerformance[strategyName];
    if (performance) {
      performance.usage++;
      const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length || 0;
      performance.avgScore = (performance.avgScore + avgScore) / 2;
    }
  }

  private getDefaultWeights(): Record<string, number> {
    return {
      lexical: 1.0,
      fulltext: 1.2,
      bm25: 1.1,
      fuzzy: 0.8,
      ngram: 0.7,
      rule_based: 1.3
    };
  }
} 