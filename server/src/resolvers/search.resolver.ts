import { Query, Resolver, Arg, ObjectType, Field, Int } from "type-graphql";
import { HybridSearchService, HybridSearchOptions } from "../search/hybrid-search.service";
import { 
  GraphSearchStrategy, 
  TopicSearchStrategy, 
  ContextualSearchStrategy 
} from "../search/advanced-strategies";
import { CodeSearchService, CODE_TECHNOLOGIES, CodeTechnology as CodeTech } from "../search/code-search.service";
import { Document } from "../entities/document.entity";

@ObjectType()
export class SearchResultWithDetails {
  @Field(() => Document)
  document: Document;

  @Field()
  score: number;

  @Field()
  matchType: string;

  @Field({ nullable: true })
  matchDetails?: string; // JSON string для складних деталей
}

@ObjectType()
export class HybridSearchResult {
  @Field(() => [SearchResultWithDetails])
  results: SearchResultWithDetails[];

  @Field(() => Int)
  totalFound: number;

  @Field()
  executionTimeMs: number;

  @Field(() => [String])
  strategiesUsed: string[];

  @Field({ nullable: true })
  recommendations?: string;
}

@ObjectType()
export class SearchStrategy {
  @Field()
  name: string;

  @Field()
  description: string;
}

@ObjectType()
export class SearchPerformance {
  @Field()
  totalStrategies: number;

  @Field()
  totalExecutionTimeMs: number;

  @Field()
  bestStrategy: string;

  @Field()
  recommendedApproach: string;
}

@ObjectType()
export class StrategyResult {
  @Field()
  strategyName: string;

  @Field(() => [SearchResultWithDetails])
  results: SearchResultWithDetails[];

  @Field(() => Int)
  resultCount: number;

  @Field()
  avgScore: number;

  @Field()
  executionTimeMs: number;
}

@ObjectType()
export class SearchComparison {
  @Field()
  query: string;

  @Field(() => [StrategyResult])
  strategyResults: StrategyResult[];

  @Field(() => SearchPerformance)
  overallPerformance: SearchPerformance;
}

@ObjectType()
export class SearchAnalytics {
  @Field(() => Int)
  totalSearches: number;

  @Field(() => [PopularQuery])
  popularQueries: PopularQuery[];

  @Field(() => [StrategyPerformance])
  strategyPerformance: StrategyPerformance[];
}

@ObjectType()
export class PopularQuery {
  @Field()
  query: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class StrategyPerformance {
  @Field()
  strategyName: string;

  @Field(() => Int)
  usage: number;

  @Field()
  avgScore: number;
}

@ObjectType()
export class CodeTechnologyInfo {
  @Field()
  value: string;

  @Field()
  label: string;

  @Field()
  description: string;
}

@ObjectType()
export class CodeSearchResult {
  @Field(() => [SearchResultWithDetails])
  results: SearchResultWithDetails[];

  @Field(() => Int)
  totalFound: number;

  @Field()
  executionTimeMs: number;

  @Field(() => [String])
  technologiesSearched: string[];

  @Field(() => [String])
  strategiesUsed: string[];

  @Field({ nullable: true })
  recommendations?: string;

  @Field({ nullable: true })
  warning?: string;

  @Field()
  isTechnical: boolean;

  @Field(() => [String], { nullable: true })
  suggestions?: string[];
}

@ObjectType()
export class QueryValidationResult {
  @Field()
  isTechnical: boolean;

  @Field({ nullable: true })
  warning?: string;

  @Field(() => [String], { nullable: true })
  suggestions?: string[];
}

@Resolver()
export class SearchResolver {
  private hybridSearchService = new HybridSearchService();
  private codeSearchService = new CodeSearchService();

  @Query(() => HybridSearchResult)
  async hybridSearch(
    @Arg("query") query: string,
    @Arg("strategies", () => [String], { nullable: true }) strategies?: string[],
    @Arg("technology", { nullable: true }) technology?: string,
    @Arg("type", { nullable: true }) type?: string,
    @Arg("ensembleMethod", { nullable: true }) ensembleMethod?: string,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<HybridSearchResult> {
    const startTime = Date.now();

    const options: HybridSearchOptions = {
      strategies: strategies || this.hybridSearchService.recommendStrategies(query),
      technology,
      type,
      limit,
      ensembleMethod: ensembleMethod as any || 'weighted_sum'
    };

    console.log(`🔍 Hybrid search request: "${query}" with options:`, options);

    const results = await this.hybridSearchService.search(query, options);
    const executionTime = Date.now() - startTime;

    return {
      results: results.map(result => ({
        document: result.document,
        score: result.score,
        matchType: result.matchType,
        matchDetails: JSON.stringify(result.matchDetails)
      })),
      totalFound: results.length,
      executionTimeMs: executionTime,
      strategiesUsed: options.strategies || [],
      recommendations: this.generateRecommendations(query, results)
    };
  }

  @Query(() => HybridSearchResult)
  async searchWithStrategy(
    @Arg("query") query: string,
    @Arg("strategy") strategy: string,
    @Arg("technology", { nullable: true }) technology?: string,
    @Arg("type", { nullable: true }) type?: string,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<HybridSearchResult> {
    const startTime = Date.now();

    const results = await this.hybridSearchService.searchWithStrategy(strategy, query, {
      technology,
      type,
      limit
    });

    const executionTime = Date.now() - startTime;

    return {
      results: results.map(result => ({
        document: result.document,
        score: result.score,
        matchType: result.matchType,
        matchDetails: JSON.stringify(result.matchDetails)
      })),
      totalFound: results.length,
      executionTimeMs: executionTime,
      strategiesUsed: [strategy],
      recommendations: this.generateSingleStrategyRecommendations(strategy, results)
    };
  }

  @Query(() => SearchComparison)
  async compareSearchStrategies(
    @Arg("query") query: string,
    @Arg("technology", { nullable: true }) technology?: string,
    @Arg("type", { nullable: true }) type?: string,
    @Arg("limit", () => Int, { defaultValue: 5 }) limit?: number
  ): Promise<SearchComparison> {
    const startTime = Date.now();

    const comparison = await this.hybridSearchService.compareStrategies(query, {
      technology,
      type,
      limit
    });

    const strategyResults: StrategyResult[] = [];
    let bestStrategy = '';
    let bestScore = 0;

    for (const [strategyName, results] of Object.entries(comparison.results)) {
      const performance = comparison.performance[strategyName];
      
      strategyResults.push({
        strategyName,
        results: results.map(result => ({
          document: result.document,
          score: result.score,
          matchType: result.matchType,
          matchDetails: JSON.stringify(result.matchDetails)
        })),
        resultCount: performance.count,
        avgScore: performance.avgScore,
        executionTimeMs: performance.executionTime
      });

      if (performance.avgScore > bestScore) {
        bestScore = performance.avgScore;
        bestStrategy = strategyName;
      }
    }

    const totalExecutionTime = Date.now() - startTime;

    return {
      query,
      strategyResults,
      overallPerformance: {
        totalStrategies: strategyResults.length,
        totalExecutionTimeMs: totalExecutionTime,
        bestStrategy,
        recommendedApproach: this.getRecommendedApproach(query, comparison.performance)
      }
    };
  }

  @Query(() => [SearchStrategy])
  async getAvailableStrategies(): Promise<SearchStrategy[]> {
    const strategies = this.hybridSearchService.getAvailableStrategies();
    
    // Додаємо розширені стратегії
    const advancedStrategies = [
      new GraphSearchStrategy(),
      new TopicSearchStrategy(),
      new ContextualSearchStrategy()
    ];

    return [
      ...strategies,
      ...advancedStrategies.map(strategy => ({
        name: strategy.name,
        description: strategy.description
      }))
    ];
  }

  @Query(() => [String])
  async getRecommendedStrategies(
    @Arg("query") query: string
  ): Promise<string[]> {
    return this.hybridSearchService.recommendStrategies(query);
  }

  @Query(() => SearchAnalytics)
  async getSearchAnalytics(): Promise<SearchAnalytics> {
    const analytics = this.hybridSearchService.getAnalytics();

    const popularQueries = Object.entries(analytics.popularQueries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    const strategyPerformance = Object.entries(analytics.strategyPerformance)
      .map(([strategyName, data]) => ({
        strategyName,
        usage: data.usage,
        avgScore: data.avgScore
      }));

    return {
      totalSearches: analytics.totalSearches,
      popularQueries,
      strategyPerformance
    };
  }

  // Додаткові спеціалізовані запити
  @Query(() => HybridSearchResult)
  async semanticSearch(
    @Arg("query") query: string,
    @Arg("technology", { nullable: true }) technology?: string,
    @Arg("useGraph", { defaultValue: false }) useGraph?: boolean,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<HybridSearchResult> {
    const strategies = ['bm25', 'ngram'];
    
    if (useGraph) {
      strategies.push('graph');
    }

    return this.hybridSearch(query, strategies, technology, undefined, 'rank_fusion', limit);
  }

  @Query(() => HybridSearchResult)
  async troubleshootSearch(
    @Arg("query") query: string,
    @Arg("technology", { nullable: true }) technology?: string,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<HybridSearchResult> {
    // Спеціалізований пошук для вирішення проблем
    const strategies = ['rule_based', 'contextual', 'topic'];
    
    return this.hybridSearch(
      query, 
      strategies, 
      technology, 
      'issue', // Фокус на проблемах
      'vote', 
      limit
    );
  }

  @Query(() => HybridSearchResult)
  async learningSearch(
    @Arg("query") query: string,
    @Arg("technology", { nullable: true }) technology?: string,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<HybridSearchResult> {
    // Спеціалізований пошук для навчання
    const strategies = ['contextual', 'topic', 'fulltext'];
    
    return this.hybridSearch(
      query, 
      strategies, 
      technology, 
      'documentation', // Фокус на документації
      'weighted_sum', 
      limit
    );
  }

  // НОВІ МЕТОДИ ДЛЯ ПОШУКУ ПО КОДУ

  @Query(() => CodeSearchResult)
  async searchCode(
    @Arg("query") query: string,
    @Arg("technologies", () => [String], { nullable: true }) technologies?: string[],
    @Arg("codeType", { nullable: true }) codeType?: string,
    @Arg("strategies", () => [String], { nullable: true }) strategies?: string[],
    @Arg("ensembleMethod", { nullable: true }) ensembleMethod?: string,
    @Arg("skipTechnicalValidation", { nullable: true, defaultValue: false }) skipTechnicalValidation?: boolean,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<CodeSearchResult> {
    const startTime = Date.now();

    // Валідація технологій
    const validTechnologies = technologies?.filter(tech => 
      Object.values(CODE_TECHNOLOGIES).includes(tech as CodeTech)
    ) as CodeTech[] || Object.values(CODE_TECHNOLOGIES);

    console.log(`🔍 Code Search request: "${query}" for technologies: ${validTechnologies.join(', ')}`);

    const searchResult = await this.codeSearchService.searchCode(query, {
      technologies: validTechnologies,
      codeType: codeType as any,
      strategies,
      ensembleMethod: ensembleMethod as any,
      skipTechnicalValidation,
      limit
    });

    const executionTime = Date.now() - startTime;

    return {
      results: searchResult.results.map(result => ({
        document: result.document,
        score: result.score,
        matchType: result.matchType,
        matchDetails: JSON.stringify(result.matchDetails)
      })),
      totalFound: searchResult.results.length,
      executionTimeMs: executionTime,
      technologiesSearched: validTechnologies,
      strategiesUsed: strategies || this.codeSearchService.getCodeOptimizedStrategies(query),
      recommendations: this.codeSearchService.getCodeSearchRecommendations(query).join("; "),
      warning: searchResult.warning,
      isTechnical: searchResult.isTechnical,
      suggestions: searchResult.suggestions
    };
  }

  @Query(() => CodeSearchResult)
  async searchCodeDocumentation(
    @Arg("query") query: string,
    @Arg("technologies", () => [String], { nullable: true }) technologies?: string[],
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<CodeSearchResult> {
    const startTime = Date.now();

    const validTechnologies = technologies?.filter(tech => 
      Object.values(CODE_TECHNOLOGIES).includes(tech as CodeTech)
    ) as CodeTech[] || Object.values(CODE_TECHNOLOGIES);

    const searchResult = await this.codeSearchService.searchCodeDocumentation(query, {
      technologies: validTechnologies,
      limit
    });

    const executionTime = Date.now() - startTime;

    return {
      results: searchResult.results.map(result => ({
        document: result.document,
        score: result.score,
        matchType: result.matchType,
        matchDetails: JSON.stringify(result.matchDetails)
      })),
      totalFound: searchResult.results.length,
      executionTimeMs: executionTime,
      technologiesSearched: validTechnologies,
      strategiesUsed: ['fulltext', 'bm25', 'rule_based'],
      recommendations: "Пошук обмежений документацією для кодових технологій",
      warning: searchResult.warning,
      isTechnical: searchResult.isTechnical,
      suggestions: searchResult.suggestions
    };
  }

  @Query(() => CodeSearchResult)
  async searchCodeIssues(
    @Arg("query") query: string,
    @Arg("technologies", () => [String], { nullable: true }) technologies?: string[],
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<CodeSearchResult> {
    const startTime = Date.now();

    const validTechnologies = technologies?.filter(tech => 
      Object.values(CODE_TECHNOLOGIES).includes(tech as CodeTech)
    ) as CodeTech[] || Object.values(CODE_TECHNOLOGIES);

    const searchResult = await this.codeSearchService.searchCodeIssues(query, {
      technologies: validTechnologies,
      limit
    });

    const executionTime = Date.now() - startTime;

    return {
      results: searchResult.results.map(result => ({
        document: result.document,
        score: result.score,
        matchType: result.matchType,
        matchDetails: JSON.stringify(result.matchDetails)
      })),
      totalFound: searchResult.results.length,
      executionTimeMs: executionTime,
      technologiesSearched: validTechnologies,
      strategiesUsed: ['rule_based', 'fuzzy', 'ngram'],
      recommendations: "Пошук обмежений issues/проблемами для кодових технологій",
      warning: searchResult.warning,
      isTechnical: searchResult.isTechnical,
      suggestions: searchResult.suggestions
    };
  }

  @Query(() => CodeSearchResult)
  async searchAPI(
    @Arg("query") query: string,
    @Arg("technologies", () => [String], { nullable: true }) technologies?: string[],
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<CodeSearchResult> {
    const startTime = Date.now();

    const validTechnologies = technologies?.filter(tech => 
      Object.values(CODE_TECHNOLOGIES).includes(tech as CodeTech)
    ) as CodeTech[] || Object.values(CODE_TECHNOLOGIES);

    const searchResult = await this.codeSearchService.searchAPI(query, {
      technologies: validTechnologies,
      limit
    });

    const executionTime = Date.now() - startTime;

    return {
      results: searchResult.results.map(result => ({
        document: result.document,
        score: result.score,
        matchType: result.matchType,
        matchDetails: JSON.stringify(result.matchDetails)
      })),
      totalFound: searchResult.results.length,
      executionTimeMs: executionTime,
      technologiesSearched: validTechnologies,
      strategiesUsed: ['bm25', 'rule_based', 'lexical'],
      recommendations: "Спеціалізований пошук API документації",
      warning: searchResult.warning,
      isTechnical: searchResult.isTechnical,
      suggestions: searchResult.suggestions
    };
  }

  @Query(() => CodeSearchResult)
  async searchByTechnology(
    @Arg("technology") technology: string,
    @Arg("query") query: string,
    @Arg("codeType", { nullable: true }) codeType?: string,
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<CodeSearchResult> {
    const startTime = Date.now();

    if (!Object.values(CODE_TECHNOLOGIES).includes(technology as CodeTech)) {
      throw new Error(`Непідтримувана технологія: ${technology}. Підтримуються: ${Object.values(CODE_TECHNOLOGIES).join(', ')}`);
    }

    const searchResult = await this.codeSearchService.searchByTechnology(
      technology as CodeTech, 
      query, 
      { 
        codeType: codeType as any,
        limit 
      }
    );

    const executionTime = Date.now() - startTime;

    return {
      results: searchResult.results.map(result => ({
        document: result.document,
        score: result.score,
        matchType: result.matchType,
        matchDetails: JSON.stringify(result.matchDetails)
      })),
      totalFound: searchResult.results.length,
      executionTimeMs: executionTime,
      technologiesSearched: [technology],
      strategiesUsed: this.codeSearchService.getCodeOptimizedStrategies(query),
      recommendations: `Пошук обмежений технологією: ${technology}`,
      warning: searchResult.warning,
      isTechnical: searchResult.isTechnical,
      suggestions: searchResult.suggestions
    };
  }

  @Query(() => CodeSearchResult)
  async searchTroubleshooting(
    @Arg("query") query: string,
    @Arg("technologies", () => [String], { nullable: true }) technologies?: string[],
    @Arg("limit", () => Int, { defaultValue: 10 }) limit?: number
  ): Promise<CodeSearchResult> {
    const startTime = Date.now();

    const validTechnologies = technologies?.filter(tech => 
      Object.values(CODE_TECHNOLOGIES).includes(tech as CodeTech)
    ) as CodeTech[] || Object.values(CODE_TECHNOLOGIES);

    const searchResult = await this.codeSearchService.searchTroubleshooting(query, {
      technologies: validTechnologies,
      limit
    });

    const executionTime = Date.now() - startTime;

    return {
      results: searchResult.results.map(result => ({
        document: result.document,
        score: result.score,
        matchType: result.matchType,
        matchDetails: JSON.stringify(result.matchDetails)
      })),
      totalFound: searchResult.results.length,
      executionTimeMs: executionTime,
      technologiesSearched: validTechnologies,
      strategiesUsed: ['rule_based', 'fuzzy', 'bm25'],
      recommendations: "Спеціалізований пошук для troubleshooting і вирішення проблем",
      warning: searchResult.warning,
      isTechnical: searchResult.isTechnical,
      suggestions: searchResult.suggestions
    };
  }

  @Query(() => [CodeTechnologyInfo])
  async getCodeTechnologies(): Promise<CodeTechnologyInfo[]> {
    return this.codeSearchService.getCodeTechnologies();
  }

  @Query(() => [String])
  async getCodeSearchRecommendations(
    @Arg("query") query: string
  ): Promise<string[]> {
    return this.codeSearchService.getCodeSearchRecommendations(query);
  }

  @Query(() => QueryValidationResult)
  async validateQuery(
    @Arg("query") query: string
  ): Promise<QueryValidationResult> {
    // Спрощена валідація - тільки перевіряємо довжину
    if (query.trim().length < 2) {
      return {
        isTechnical: false,
        warning: 'Запит занадто короткий. Введіть більше деталей.',
        suggestions: ['Додайте більше ключових слів для пошуку']
      };
    }

    // Всі запити вважаються технічними - нехай AI модель вирішує
    return {
      isTechnical: true,
      warning: undefined,
      suggestions: undefined
    };
  }

  // Допоміжні методи
  private generateRecommendations(query: string, results: any[]): string {
    const recommendations: string[] = [];
    
    if (results.length === 0) {
      recommendations.push("Спробуйте використати менш специфічні терміни");
      recommendations.push("Використайте fuzzy search для неточних збігів");
    } else if (results.length < 3) {
      recommendations.push("Спробуйте розширити запит синонімами");
      recommendations.push("Використайте graph search для знаходження пов'язаних документів");
    } else {
      recommendations.push("Результати виглядають релевантними");
      if (query.length > 20) {
        recommendations.push("Для довгих запитів рекомендується BM25 або full-text search");
      }
    }

    return recommendations.join("; ");
  }

  private generateSingleStrategyRecommendations(strategy: string, results: any[]): string {
    const strategyTips: Record<string, string> = {
      'lexical': 'Добре для точних збігів ключових слів',
      'fulltext': 'Ефективний для природномовних запитів',
      'fuzzy': 'Корисний коли в запиті можуть бути помилки',
      'bm25': 'Відмінний для ранжування релевантності',
      'ngram': 'Ефективний для часткових збігів',
      'rule_based': 'Використовує контекстні правила для кращих результатів'
    };

    return strategyTips[strategy] || 'Спеціалізована стратегія пошуку';
  }

  private getRecommendedApproach(query: string, performance: Record<string, any>): string {
    // Аналізуємо продуктивність та рекомендуємо підхід
    const bestPerforming = Object.entries(performance)
      .sort(([, a], [, b]) => (b as any).avgScore - (a as any).avgScore)
      .slice(0, 2)
      .map(([name]) => name);

    if (query.length < 10) {
      return `Для коротких запитів рекомендується: ${bestPerforming.join(' + fuzzy')}`;
    } else if (query.length > 30) {
      return `Для довгих запитів рекомендується: fulltext + bm25`;
    } else {
      return `Оптимальна комбінація: ${bestPerforming.join(' + ')}`;
    }
  }
} 