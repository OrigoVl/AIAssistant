import { SearchStrategy, SearchResult, SearchOptions } from "./search-strategies";
import { Document } from "../entities/document.entity";
import { AppDataSource } from "../data-source";

// 7. Graph-based Search (Графовий пошук)
export class GraphSearchStrategy implements SearchStrategy {
  name = "graph";
  description = "Графовий пошук на основі зв'язків між документами";

  private docRepository = AppDataSource.getRepository(Document);

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 10, technology, type } = options;
    
    // Спочатку знаходимо прямі збіги
    const directMatches = await this.findDirectMatches(query, technology, type);
    
    if (directMatches.length === 0) {
      return [];
    }

    // Будуємо граф зв'язків
    const relatedDocuments = await this.findRelatedDocuments(directMatches, technology);
    
    // Комбінуємо результати з ваговими коефіцієнтами
    const allResults = [
      ...directMatches.map(doc => ({ document: doc, score: 1.0, relation: 'direct' })),
      ...relatedDocuments.map(item => ({ 
        document: item.document, 
        score: item.score * 0.6, // Зв'язані документи мають менший вес
        relation: item.relation 
      }))
    ];

    // Усуваємо дублікати та сортуємо
    const uniqueResults = this.removeDuplicates(allResults);
    
    return uniqueResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        document: item.document,
        score: item.score,
        matchType: "graph",
        matchDetails: { 
          relation: item.relation,
          graphDepth: item.relation === 'direct' ? 0 : 1
        }
      }));
  }

  private async findDirectMatches(query: string, technology?: string, type?: string): Promise<Document[]> {
    const queryBuilder = this.docRepository.createQueryBuilder("doc");
    
    queryBuilder.where("doc.title ILIKE :query OR doc.content ILIKE :query", {
      query: `%${query}%`
    });

    if (technology) {
      queryBuilder.andWhere("doc.technology = :technology", { technology });
    }

    if (type) {
      queryBuilder.andWhere("doc.type = :type", { type });
    }

    return queryBuilder.take(5).getMany();
  }

  private async findRelatedDocuments(
    directMatches: Document[], 
    technology?: string
  ): Promise<Array<{ document: Document, score: number, relation: string }>> {
    const relatedDocs: Array<{ document: Document, score: number, relation: string }> = [];

    for (const doc of directMatches) {
      // Знаходимо документи з тієї ж технології
      if (technology) {
        const techRelated = await this.docRepository
          .createQueryBuilder("doc")
          .where("doc.technology = :technology", { technology })
          .andWhere("doc.id != :id", { id: doc.id })
          .take(3)
          .getMany();

        relatedDocs.push(...techRelated.map(relDoc => ({
          document: relDoc,
          score: 0.8,
          relation: 'same_technology'
        })));
      }

      // Знаходимо документи з схожими заголовками
      const titleWords = doc.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (titleWords.length > 0) {
        const titleRelated = await this.findDocumentsByTitleSimilarity(titleWords, doc.id);
        relatedDocs.push(...titleRelated.map(relDoc => ({
          document: relDoc,
          score: 0.7,
          relation: 'similar_title'
        })));
      }
    }

    return relatedDocs;
  }

  private async findDocumentsByTitleSimilarity(titleWords: string[], excludeId: number): Promise<Document[]> {
    const queryBuilder = this.docRepository.createQueryBuilder("doc");
    
    titleWords.forEach((word, index) => {
      const condition = index === 0 ? "where" : "orWhere";
      queryBuilder[condition]("LOWER(doc.title) LIKE :word", { word: `%${word}%` });
    });

    queryBuilder.andWhere("doc.id != :excludeId", { excludeId });

    return queryBuilder.take(2).getMany();
  }

  private removeDuplicates(results: Array<{ document: Document, score: number, relation: string }>): Array<{ document: Document, score: number, relation: string }> {
    const seen = new Set<number>();
    return results.filter(item => {
      if (seen.has(item.document.id)) {
        return false;
      }
      seen.add(item.document.id);
      return true;
    });
  }
}

// 8. Topic-based Search (Тематичний пошук)
export class TopicSearchStrategy implements SearchStrategy {
  name = "topic";
  description = "Тематичний пошук на основі ключових слів та категорій";

  private docRepository = AppDataSource.getRepository(Document);
  private topicKeywords = {
    'installation': ['install', 'setup', 'download', 'npm', 'yarn', 'getting started'],
    'configuration': ['config', 'settings', 'options', 'configure', 'env'],
    'api': ['api', 'method', 'function', 'endpoint', 'interface'],
    'errors': ['error', 'bug', 'issue', 'problem', 'fix', 'troubleshoot'],
    'components': ['component', 'widget', 'element', 'ui', 'view'],
    'styling': ['css', 'style', 'theme', 'design', 'layout'],
    'data': ['data', 'model', 'store', 'state', 'variable'],
    'routing': ['route', 'navigation', 'link', 'redirect', 'path']
  };

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 10, technology, type } = options;
    
    // Визначаємо теми на основі запиту
    const detectedTopics = this.detectTopics(query);
    console.log(`Detected topics for "${query}":`, detectedTopics);

    if (detectedTopics.length === 0) {
      return [];
    }

    const results: SearchResult[] = [];

    for (const topicInfo of detectedTopics) {
      const topicResults = await this.searchByTopic(topicInfo, technology, type);
      results.push(...topicResults.map(result => ({
        ...result,
        score: result.score * topicInfo.confidence,
        matchDetails: {
          ...result.matchDetails,
          topic: topicInfo.topic,
          confidence: topicInfo.confidence
        }
      })));
    }

    // Комбінуємо результати та усуваємо дублікати
    const uniqueResults = this.combineTopicResults(results);
    
    return uniqueResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private detectTopics(query: string): Array<{ topic: string, confidence: number }> {
    const lowerQuery = query.toLowerCase();
    const detectedTopics: Array<{ topic: string, confidence: number }> = [];

    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      let matches = 0;
      let totalWeight = 0;

      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          matches++;
          // Довші ключові слова мають більший вес
          totalWeight += keyword.length;
        }
      }

      if (matches > 0) {
        const confidence = (matches / keywords.length) * (totalWeight / (matches * 10));
        detectedTopics.push({ topic, confidence: Math.min(confidence, 1.0) });
      }
    }

    return detectedTopics.sort((a, b) => b.confidence - a.confidence);
  }

  private async searchByTopic(
    topicInfo: { topic: string, confidence: number }, 
    technology?: string, 
    type?: string
  ): Promise<SearchResult[]> {
    const keywords = this.topicKeywords[topicInfo.topic as keyof typeof this.topicKeywords];
    const queryBuilder = this.docRepository.createQueryBuilder("doc");

    // Створюємо OR умови для всіх ключових слів теми
    keywords.forEach((keyword, index) => {
      const condition = index === 0 ? "where" : "orWhere";
      queryBuilder[condition]("LOWER(doc.title) LIKE :keyword OR LOWER(doc.content) LIKE :keyword", {
        keyword: `%${keyword}%`
      });
    });

    if (technology) {
      queryBuilder.andWhere("doc.technology = :technology", { technology });
    }

    if (type) {
      queryBuilder.andWhere("doc.type = :type", { type });
    }

    const documents = await queryBuilder.take(5).getMany();

    return documents.map(doc => ({
      document: doc,
      score: this.calculateTopicScore(doc, keywords),
      matchType: "topic",
      matchDetails: { 
        topic: topicInfo.topic,
        matchedKeywords: this.getMatchedKeywords(doc, keywords)
      }
    }));
  }

  private calculateTopicScore(document: Document, keywords: string[]): number {
    const text = (document.title + " " + document.content).toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
      if (matches > 0) {
        score += matches * keyword.length; // Довші ключові слова важливіші
      }
    }

    return Math.min(score / 100, 1.0); // Нормалізуємо до 1.0
  }

  private getMatchedKeywords(document: Document, keywords: string[]): string[] {
    const text = (document.title + " " + document.content).toLowerCase();
    return keywords.filter(keyword => text.includes(keyword));
  }

  private combineTopicResults(results: SearchResult[]): SearchResult[] {
    const documentScores = new Map<number, {
      document: Document,
      totalScore: number,
      topics: string[],
      details: any[]
    }>();

    for (const result of results) {
      const docId = result.document.id;
      
      if (documentScores.has(docId)) {
        const existing = documentScores.get(docId)!;
        existing.totalScore += result.score;
        existing.topics.push(result.matchDetails.topic);
        existing.details.push(result.matchDetails);
      } else {
        documentScores.set(docId, {
          document: result.document,
          totalScore: result.score,
          topics: [result.matchDetails.topic],
          details: [result.matchDetails]
        });
      }
    }

    return Array.from(documentScores.values()).map(item => ({
      document: item.document,
      score: item.totalScore,
      matchType: "topic_combined",
      matchDetails: {
        topics: item.topics,
        topicCount: item.topics.length,
        details: item.details
      }
    }));
  }
}

// 9. Contextual Search (Контекстний пошук)
export class ContextualSearchStrategy implements SearchStrategy {
  name = "contextual";
  description = "Контекстний пошук з урахуванням контексту запиту";

  private docRepository = AppDataSource.getRepository(Document);

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 10, technology, type } = options;
    
    // Аналізуємо контекст запиту
    const context = this.analyzeContext(query);
    console.log(`Query context analysis:`, context);

    // Розширюємо запит на основі контексту
    const expandedQuery = this.expandQuery(query, context);
    
    // Виконуємо контекстний пошук
    const results = await this.performContextualSearch(expandedQuery, context, technology, type);
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private analyzeContext(query: string): {
    intent: string,
    entities: string[],
    sentiment: string,
    complexity: string
  } {
    const lowerQuery = query.toLowerCase();
    
    // Визначення наміру
    let intent = 'search';
    if (/\b(how|what|why|when|where)\b/.test(lowerQuery)) {
      intent = 'question';
    } else if (/\b(fix|solve|error|problem)\b/.test(lowerQuery)) {
      intent = 'troubleshoot';
    } else if (/\b(example|demo|tutorial)\b/.test(lowerQuery)) {
      intent = 'learn';
    }

    // Визначення сутностей (технічних термінів)
    const entities = [];
    const techTerms = ['component', 'api', 'function', 'method', 'class', 'interface', 'module'];
    for (const term of techTerms) {
      if (lowerQuery.includes(term)) {
        entities.push(term);
      }
    }

    // Визначення складності
    let complexity = 'simple';
    if (query.length > 50 && entities.length > 2) {
      complexity = 'complex';
    } else if (query.length > 20 || entities.length > 0) {
      complexity = 'medium';
    }

    // Визначення тональності
    let sentiment = 'neutral';
    if (/\b(great|good|excellent|perfect)\b/.test(lowerQuery)) {
      sentiment = 'positive';
    } else if (/\b(bad|wrong|broken|issue|problem)\b/.test(lowerQuery)) {
      sentiment = 'negative';
    }

    return { intent, entities, sentiment, complexity };
  }

  private expandQuery(query: string, context: any): string {
    let expandedQuery = query;

    // Розширення на основі наміру
    if (context.intent === 'troubleshoot') {
      expandedQuery += ' error solution fix';
    } else if (context.intent === 'learn') {
      expandedQuery += ' tutorial example guide';
    }

    // Додавання синонімів для сутностей
    const synonyms: Record<string, string[]> = {
      'component': ['widget', 'element', 'part'],
      'api': ['interface', 'endpoint', 'service'],
      'function': ['method', 'procedure', 'routine']
    };

    for (const entity of context.entities) {
      if (synonyms[entity]) {
        expandedQuery += ' ' + synonyms[entity].join(' ');
      }
    }

    return expandedQuery;
  }

  private async performContextualSearch(
    expandedQuery: string,
    context: any,
    technology?: string,
    type?: string
  ): Promise<SearchResult[]> {
    const queryBuilder = this.docRepository.createQueryBuilder("doc");
    
    // Розбиваємо розширений запит на ключові слова
    const keywords = expandedQuery.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    
    // Створюємо гнучкий запит
    keywords.forEach((keyword, index) => {
      const condition = index === 0 ? "where" : "orWhere";
      queryBuilder[condition]("LOWER(doc.title) LIKE :keyword OR LOWER(doc.content) LIKE :keyword", {
        keyword: `%${keyword}%`
      });
    });

    // Додаємо фільтри на основі контексту
    if (context.intent === 'troubleshoot') {
      queryBuilder.andWhere("doc.type = 'issue' OR LOWER(doc.content) LIKE '%error%'");
    } else if (context.intent === 'learn') {
      queryBuilder.andWhere("doc.type = 'documentation' OR LOWER(doc.title) LIKE '%guide%' OR LOWER(doc.title) LIKE '%tutorial%'");
    }

    if (technology) {
      queryBuilder.andWhere("doc.technology = :technology", { technology });
    }

    if (type) {
      queryBuilder.andWhere("doc.type = :type", { type });
    }

    const documents = await queryBuilder.take(15).getMany();

    return documents.map(doc => ({
      document: doc,
      score: this.calculateContextualScore(doc, keywords, context),
      matchType: "contextual",
      matchDetails: {
        intent: context.intent,
        entities: context.entities,
        expandedQuery,
        contextScore: this.getContextScore(doc, context)
      }
    }));
  }

  private calculateContextualScore(document: Document, keywords: string[], context: any): number {
    const text = (document.title + " " + document.content).toLowerCase();
    let score = 0;

    // Базовий score на основі збігів ключових слів
    for (const keyword of keywords) {
      const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
      score += matches;
    }

    // Бонуси на основі контексту
    if (context.intent === 'troubleshoot' && document.type === 'issue') {
      score *= 1.5;
    }

    if (context.intent === 'learn' && document.type === 'documentation') {
      score *= 1.3;
    }

    // Бонус для точних збігів сутностей
    for (const entity of context.entities) {
      if (text.includes(entity)) {
        score *= 1.2;
      }
    }

    return Math.min(score / 10, 10.0); // Нормалізуємо
  }

  private getContextScore(document: Document, context: any): number {
    let contextScore = 1.0;

    if (context.intent === 'troubleshoot' && document.type === 'issue') {
      contextScore += 0.5;
    }

    if (context.intent === 'learn' && document.type === 'documentation') {
      contextScore += 0.3;
    }

    return contextScore;
  }
} 