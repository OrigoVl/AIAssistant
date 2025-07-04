import { HybridSearchService, HybridSearchOptions } from "./hybrid-search.service";
import { SearchResult } from "./search-strategies";

// Константи для кодових технологій
export const CODE_TECHNOLOGIES = {
  VUE: 'vue',
  NODE: 'node', 
  TYPESCRIPT: 'typescript',
  GRAPESJS: 'grapesjs'
} as const;

export type CodeTechnology = typeof CODE_TECHNOLOGIES[keyof typeof CODE_TECHNOLOGIES];

export interface CodeSearchOptions extends Omit<HybridSearchOptions, 'technology'> {
  technologies?: CodeTechnology[];
  codeType?: 'documentation' | 'issue' | 'example';
  language?: 'javascript' | 'typescript' | 'vue' | 'html' | 'css';
  skipTechnicalValidation?: boolean; // Опція для пропуску валідації
}

// Тип результату з попередженням
export interface CodeSearchResult {
  results: SearchResult[];
  warning?: string;
  isTechnical: boolean;
  suggestions?: string[];
}

export class CodeSearchService {
  private hybridSearchService = new HybridSearchService();

  // Основний метод пошуку по коду з валідацією
  async searchCode(query: string, options: CodeSearchOptions = {}): Promise<CodeSearchResult> {
    // Перевіряємо чи запит технічний
    const validationResult = this.validateTechnicalQuery(query);
    
    if (!validationResult.isTechnical && !options.skipTechnicalValidation) {
      return {
        results: [],
        warning: validationResult.warning,
        isTechnical: false,
        suggestions: validationResult.suggestions
      };
    }

    const {
      technologies = Object.values(CODE_TECHNOLOGIES),
      codeType,
      strategies = this.getCodeOptimizedStrategies(query),
      ensembleMethod = 'weighted_sum',
      limit = 10
    } = options;

    console.log(`🔍 Code Search: "${query}" in technologies: ${technologies.join(', ')}`);

    let searchResults: SearchResult[] = [];

    // Якщо вказана тільки одна технологія, використовуємо стандартний пошук
    if (technologies.length === 1) {
      searchResults = await this.hybridSearchService.search(query, {
        ...options,
        technology: technologies[0],
        type: codeType,
        strategies,
        ensembleMethod,
        limit
      });
    } else {
      // Багатотехнологічний пошук
      const technologyResults = await Promise.all(
        technologies.map(async tech => {
          const results = await this.hybridSearchService.search(query, {
            ...options,
            technology: tech,
            type: codeType,
            strategies,
            ensembleMethod,
            limit: Math.ceil(limit / technologies.length) + 2 // Трохи більше для кращого розмаїття
          });

          return results.map(result => ({
            ...result,
            score: result.score * this.getTechnologyWeight(tech, query),
            matchDetails: {
              ...result.matchDetails,
              searchTechnology: tech
            }
          }));
        })
      );

      // Об'єднуємо та ранжуємо результати
      const allResults = technologyResults.flat();
      const uniqueResults = this.deduplicateResults(allResults);

      searchResults = uniqueResults
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    return {
      results: searchResults,
      isTechnical: true,
      warning: searchResults.length === 0 ? 'Не знайдено результатів за вашим запитом' : undefined
    };
  }

  // Валідація технічного запиту
  private validateTechnicalQuery(query: string): { 
    isTechnical: boolean; 
    warning?: string; 
    suggestions?: string[] 
  } {
    const lowerQuery = query.toLowerCase().trim();
    
    if (lowerQuery.length < 2) {
      return {
        isTechnical: false,
        warning: 'Запит занадто короткий. Введіть більше деталей.',
        suggestions: ['Додайте більше ключових слів', 'Використовуйте технічні терміни']
      };
    }

    // Технічні ключові слова
    const technicalKeywords = [
      // Технології
      'vue', 'node', 'typescript', 'javascript', 'grapesjs', 'react', 'angular',
      // Програмування
      'component', 'function', 'method', 'class', 'interface', 'api', 'library',
      'framework', 'code', 'script', 'programming', 'development', 'web',
      // Проблеми та вирішення
      'error', 'bug', 'issue', 'exception', 'debug', 'fix', 'solution',
      'problem', 'troubleshoot', 'compilation', 'runtime',
      // Технічні концепції
      'async', 'await', 'promise', 'callback', 'event', 'handler', 'listener',
      'lifecycle', 'state', 'props', 'data', 'computed', 'watch', 'reactive',
      'server', 'client', 'backend', 'frontend', 'database', 'query',
      'authentication', 'authorization', 'middleware', 'router', 'route',
      'module', 'import', 'export', 'require', 'npm', 'package',
      // Типи файлів та розширення
      '.js', '.ts', '.vue', '.html', '.css', '.json', '.md',
      // Команди та інструменти
      'install', 'build', 'deploy', 'test', 'run', 'start', 'dev',
      'git', 'github', 'repository', 'commit', 'branch', 'merge'
    ];

    // Нетехнічні ключові слова (стоп-слова)
    const nonTechnicalKeywords = [
      // Їжа та готування
      'борщ', 'суп', 'каша', 'хліб', 'м\'яso', 'риба', 'овочі', 'фрукти',
      'готувати', 'варити', 'смажити', 'пекти', 'їжа', 'рецепт', 'кухня',
      'ресторан', 'кафе', 'страва', 'обід', 'вечеря', 'сніданок',
      // Побут
      'прибирання', 'миття', 'прання', 'покупки', 'магазин', 'дім', 'квартира',
      'ремонт', 'меблі', 'одяг', 'взуття', 'косметика', 'гігієна',
      // Здоров\'я
      'лікар', 'хвороба', 'ліки', 'лікування', 'симптоми', 'біль', 'температура',
      'грип', 'застуда', 'вітаміни', 'дієта', 'спорт', 'фітнес',
      // Розваги та хобі
      'фільм', 'музика', 'книга', 'гра', 'спорт', 'подорож', 'відпочинок',
      'телевізор', 'кіно', 'театр', 'концерт', 'виставка', 'музей',
      // Природа та погода
      'погода', 'дощ', 'сонце', 'сніг', 'вітер', 'тепло', 'холодно',
      'весна', 'літо', 'осінь', 'зима', 'ліс', 'море', 'гори', 'річка',
      // Особисте життя
      'сім\'я', 'друзі', 'любов', 'відносини', 'весілля', 'дитина', 'школа',
      'університет', 'робота', 'зарплата', 'відпустка', 'пенсія'
    ];

    // Перевіряємо на наявність нетехнічних слів
    const hasNonTechnicalWords = nonTechnicalKeywords.some(keyword => 
      lowerQuery.includes(keyword)
    );

    if (hasNonTechnicalWords) {
      return {
        isTechnical: false,
        warning: '🤖 Цей сервіс працює тільки з технічними запитами про програмування. Ваш запит здається нетехнічним.',
        suggestions: [
          'Задайте питання про Vue.js, Node.js, TypeScript або GrapesJS',
          'Приклади: "як створити компонент у Vue", "async/await в Node.js", "типи в TypeScript"',
          'Якщо у вас технічна проблема, опишіть її детальніше'
        ]
      };
    }

    // Перевіряємо на наявність технічних слів
    const technicalWordsCount = technicalKeywords.filter(keyword => 
      lowerQuery.includes(keyword)
    ).length;

    // Якщо є хоча б одне технічне слово, вважаємо запит технічним
    if (technicalWordsCount > 0) {
      return { isTechnical: true };
    }

    // Перевіряємо на загальні патерни технічних запитів
    const technicalPatterns = [
      /how\s+to\s+.*(code|program|develop|build|create|implement)/i,
      /як\s+.*(написати|створити|зробити|реалізувати|налаштувати).*код/i,
      /error.*in.*(vue|node|typescript|javascript)/i,
      /помилка.*в.*(vue|node|typescript|javascript)/i,
      /(функція|метод|клас|компонент)/i,
      /(function|method|class|component)/i
    ];

    const hasMatches = technicalPatterns.some(pattern => pattern.test(lowerQuery));
    
    if (hasMatches) {
      return { isTechnical: true };
    }

    // Якщо запит не містить очевидно нетехнічних слів, але й немає технічних,
    // даємо шанс і попереджаємо
    return {
      isTechnical: false,
      warning: '⚠️  Не впевнений, що це технічний запит. Цей сервіс спеціалізується на програмуванні.',
      suggestions: [
        'Якщо ваш запит стосується програмування, додайте технічні терміни',
        'Вкажіть технологію: Vue.js, Node.js, TypeScript, GrapesJS',
        'Приклади: "vue router", "node express server", "typescript interfaces"'
      ]
    };
  }

  // Оновлені методи з новим типом результату
  async searchCodeDocumentation(query: string, options: Omit<CodeSearchOptions, 'codeType'> = {}): Promise<CodeSearchResult> {
    const result = await this.searchCode(query, {
      ...options,
      codeType: 'documentation',
      strategies: ['fulltext', 'bm25', 'rule_based']
    });

    if (!result.isTechnical) {
      return result;
    }

    return {
      ...result,
      warning: result.results.length === 0 ? 'Не знайдено документації за вашим запитом' : undefined
    };
  }

  async searchCodeIssues(query: string, options: Omit<CodeSearchOptions, 'codeType'> = {}): Promise<CodeSearchResult> {
    const result = await this.searchCode(query, {
      ...options,
      codeType: 'issue',
      strategies: ['rule_based', 'fuzzy', 'ngram']
    });

    if (!result.isTechnical) {
      return result;
    }

    return {
      ...result,
      warning: result.results.length === 0 ? 'Не знайдено issues за вашим запитом' : undefined
    };
  }

  async searchAPI(query: string, options: CodeSearchOptions = {}): Promise<CodeSearchResult> {
    const apiTerms = ['api', 'method', 'function', 'property', 'interface'];
    const enhancedQuery = `${query} ${apiTerms.join(' ')}`;
    
    return this.searchCode(enhancedQuery, {
      ...options,
      codeType: 'documentation',
      strategies: ['bm25', 'rule_based', 'lexical']
    });
  }

  async searchByTechnology(technology: CodeTechnology, query: string, options: Omit<CodeSearchOptions, 'technologies'> = {}): Promise<CodeSearchResult> {
    if (!Object.values(CODE_TECHNOLOGIES).includes(technology)) {
      throw new Error(`Unsupported technology: ${technology}. Supported: ${Object.values(CODE_TECHNOLOGIES).join(', ')}`);
    }

    return this.searchCode(query, {
      ...options,
      technologies: [technology]
    });
  }

  async searchTroubleshooting(query: string, options: CodeSearchOptions = {}): Promise<CodeSearchResult> {
    const troubleshootingTerms = ['error', 'bug', 'issue', 'problem', 'fix', 'solution'];
    const enhancedQuery = query.toLowerCase().includes('error') || query.toLowerCase().includes('bug') 
      ? query 
      : `${query} ${troubleshootingTerms.slice(0, 2).join(' ')}`;

    return this.searchCode(enhancedQuery, {
      ...options,
      codeType: 'issue',
      strategies: ['rule_based', 'fuzzy', 'bm25'],
      ensembleMethod: 'vote'
    });
  }

  // Метод для ручної валідації (для тестування)
  validateQuery(query: string): { 
    isTechnical: boolean; 
    warning?: string; 
    suggestions?: string[] 
  } {
    return this.validateTechnicalQuery(query);
  }

  // Отримання оптимізованих стратегій для коду
  getCodeOptimizedStrategies(query: string): string[] {
    const strategies: string[] = [];

    // Для коротких технічних запитів
    if (query.length < 10) {
      strategies.push('lexical', 'fuzzy');
    }

    // Для довгих описових запитів
    if (query.length > 20) {
      strategies.push('fulltext', 'bm25');
    }

    // Для запитів з помилками
    if (/\b(error|bug|issue|exception)\b/i.test(query)) {
      strategies.push('rule_based', 'ngram');
    }

    // Для API запитів
    if (/\b(api|method|function|class)\b/i.test(query)) {
      strategies.push('bm25', 'lexical');
    }

    // За замовчуванням для коду
    if (strategies.length === 0) {
      strategies.push('bm25', 'rule_based');
    }

    return [...new Set(strategies)];
  }

  // Визначення ваги технології відносно запиту
  private getTechnologyWeight(technology: CodeTechnology, query: string): number {
    const lowerQuery = query.toLowerCase();
    
    // Базова вага
    let weight = 1.0;
    
    // Збільшуємо вагу якщо технологія згадується в запиті
    if (lowerQuery.includes(technology)) {
      weight += 0.5;
    }

    // Специфічні ключові слова для технологій
    const techKeywords: Record<CodeTechnology, string[]> = {
      vue: ['component', 'directive', 'computed', 'watch', 'reactive', 'composition'],
      node: ['server', 'express', 'npm', 'module', 'require', 'async'],
      typescript: ['interface', 'type', 'generic', 'enum', 'decorator', 'strict'],
      grapesjs: ['editor', 'block', 'component', 'canvas', 'panel', 'trait']
    };

    const keywords = techKeywords[technology] || [];
    const matchingKeywords = keywords.filter(keyword => lowerQuery.includes(keyword));
    
    if (matchingKeywords.length > 0) {
      weight += matchingKeywords.length * 0.2;
    }

    return weight;
  }

  // Видалення дублікатів результатів
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<number>();
    const unique: SearchResult[] = [];

    for (const result of results) {
      if (!seen.has(result.document.id)) {
        seen.add(result.document.id);
        unique.push(result);
      } else {
        // Якщо документ вже є, об'єднуємо score
        const existingIndex = unique.findIndex(r => r.document.id === result.document.id);
        if (existingIndex !== -1) {
          const existing = unique[existingIndex];
          existing.score = Math.max(existing.score, result.score);
          
          // Об'єднуємо matchDetails
          if (existing.matchDetails && result.matchDetails) {
            existing.matchDetails = {
              ...existing.matchDetails,
              ...result.matchDetails,
              combinedFrom: [
                ...(existing.matchDetails.combinedFrom || [existing.matchDetails.searchTechnology]),
                result.matchDetails.searchTechnology
              ].filter(Boolean)
            };
          }
        }
      }
    }

    return unique;
  }

  // Отримання інформації про підтримувані технології
  getCodeTechnologies(): Array<{ value: CodeTechnology, label: string, description: string }> {
    return [
      {
        value: CODE_TECHNOLOGIES.VUE,
        label: 'Vue.js',
        description: 'Progressive JavaScript framework'
      },
      {
        value: CODE_TECHNOLOGIES.NODE,
        label: 'Node.js',
        description: 'JavaScript runtime environment'
      },
      {
        value: CODE_TECHNOLOGIES.TYPESCRIPT,
        label: 'TypeScript',
        description: 'Typed superset of JavaScript'
      },
      {
        value: CODE_TECHNOLOGIES.GRAPESJS,
        label: 'GrapesJS',
        description: 'Web Builder Framework'
      }
    ];
  }

  // Рекомендації для кодового пошуку
  getCodeSearchRecommendations(query: string): string[] {
    const recommendations: string[] = [];
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('error') || lowerQuery.includes('bug')) {
      recommendations.push('Спробуйте пошук в issues з troubleshooting запитом');
    }

    if (lowerQuery.length < 5) {
      recommendations.push('Додайте більше деталей для точнішого пошуку');
    }

    if (!Object.values(CODE_TECHNOLOGIES).some(tech => lowerQuery.includes(tech))) {
      recommendations.push('Вкажіть конкретну технологію для кращих результатів');
    }

    return recommendations;
  }
} 