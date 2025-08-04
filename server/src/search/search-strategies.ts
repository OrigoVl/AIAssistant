import { Repository } from "typeorm";
import { Document } from "../entities/document.entity";
import { AppDataSource } from "../data-source";

export interface SearchResult {
  document: Document;
  score: number;
  matchType: string;
  matchDetails?: any;
}

export interface SearchStrategy {
  name: string;
  description: string;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}

export interface SearchOptions {
  limit?: number;
  technology?: string;
  type?: string;
  fuzzyThreshold?: number;
  includeContent?: boolean;
}

// 1. Лексичний пошук (Keyword/Token Search)
export class LexicalSearchStrategy implements SearchStrategy {
  name = "lexical";
  description = "Exact keyword search";

  private docRepository = AppDataSource.getRepository(Document);

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 10, technology, type } = options;
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    
    const queryBuilder = this.docRepository.createQueryBuilder("doc");
    
    // Додаємо умови пошуку для кожного ключового слова
    keywords.forEach((keyword, index) => {
      const condition = index === 0 ? "where" : "orWhere";
      queryBuilder[condition](
        "LOWER(doc.title) LIKE :keyword OR LOWER(doc.content) LIKE :keyword",
        { keyword: `%${keyword}%` }
      );
    });

    if (technology) {
      queryBuilder.andWhere("doc.technology = :technology", { technology });
    }

    if (type) {
      queryBuilder.andWhere("doc.type = :type", { type });
    }

    const documents = await queryBuilder.take(limit).getMany();

    return documents.map(doc => {
      const titleMatches = this.countMatches(doc.title.toLowerCase(), keywords);
      const contentMatches = this.countMatches(doc.content.toLowerCase(), keywords);
      
      return {
        document: doc,
        score: titleMatches * 3 + contentMatches, // Заголовки важливіші
        matchType: "lexical",
        matchDetails: { titleMatches, contentMatches, keywords }
      };
    }).sort((a, b) => b.score - a.score);
  }

  private countMatches(text: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => {
      const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
      return count + matches;
    }, 0);
  }
}

// 2. Full-Text Search (PostgreSQL)
export class FullTextSearchStrategy implements SearchStrategy {
  name = "fulltext";
  description = "PostgreSQL full-text search with ranking";

  private docRepository = AppDataSource.getRepository(Document);

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 10, technology, type } = options;
    
    // Prepare query for PostgreSQL full-text search
    const tsQuery = query.split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => `${word}:*`)
      .join(' & ');

    if (!tsQuery) {
      return [];
    }

    let sql = `
      SELECT doc.*, 
             ts_rank(to_tsvector('english', doc.title || ' ' || doc.content), to_tsquery('english', $1)) as rank,
             ts_headline('english', doc.content, to_tsquery('english', $1), 
                        'MaxWords=30, MinWords=10') as headline
      FROM document doc
      WHERE to_tsvector('english', doc.title || ' ' || doc.content) @@ to_tsquery('english', $1)
    `;

    const params: any[] = [tsQuery];
    let paramIndex = 2;

    if (technology) {
      sql += ` AND doc.technology = $${paramIndex}`;
      params.push(technology);
      paramIndex++;
    }

    if (type) {
      sql += ` AND doc.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    sql += ` ORDER BY rank DESC LIMIT $${paramIndex}`;
    params.push(limit);

    try {
      const results = await AppDataSource.query(sql, params);

      return results.map((row: any) => ({
        document: {
          id: row.id,
          title: row.title,
          content: row.content,
          source: row.source,
          type: row.type,
          technology: row.technology,
          createdAt: row.created_at
        } as Document,
        score: parseFloat(row.rank),
        matchType: "fulltext",
        matchDetails: { 
          headline: row.headline,
          rank: row.rank,
          query: tsQuery
        }
      }));
    } catch (error) {
      console.error('FullTextSearchStrategy error:', error);
      // Fallback to lexical search if full-text search fails
      const lexicalStrategy = new LexicalSearchStrategy();
      return lexicalStrategy.search(query, options);
    }
  }
}

// 3. BM25 Algorithm (Best Matching)
export class BM25SearchStrategy implements SearchStrategy {
  name = "bm25";
  description = "BM25 document ranking algorithm";

  private docRepository = AppDataSource.getRepository(Document);

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 10, technology, type } = options;
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    const documents = await this.getDocuments(technology, type);
    const scoredDocs = await Promise.all(
      documents.map(doc => this.calculateBM25Score(doc, terms))
    );

    return scoredDocs
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getDocuments(technology?: string, type?: string): Promise<Document[]> {
    const queryBuilder = this.docRepository.createQueryBuilder("doc");
    
    if (technology) {
      queryBuilder.where("doc.technology = :technology", { technology });
    }
    
    if (type) {
      queryBuilder.andWhere("doc.type = :type", { type });
    }

    return queryBuilder.getMany();
  }

  private async calculateBM25Score(document: Document, terms: string[]): Promise<SearchResult> {
    const k1 = 1.5; // term frequency saturation point
    const b = 0.75; // length normalization parameter
    
    const docText = (document.title + " " + document.content).toLowerCase();
    const docWords = docText.split(/\s+/);
    const docLength = docWords.length;
    
    // Припустимо середню довжину документа (можна обчислити динамічно)
    const avgDocLength = 500;
    
    let score = 0;
    const termFreqs: Record<string, number> = {};
    
    for (const term of terms) {
      const tf = (docText.match(new RegExp(term, 'g')) || []).length;
      termFreqs[term] = tf;
      
      if (tf > 0) {
        // Спрощений IDF (в реальності потрібен корпус документів)
        const idf = Math.log(1000 / (tf + 1)); // 1000 - припустима кількість документів
        
        const tfComponent = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLength / avgDocLength)));
        score += idf * tfComponent;
      }
    }

    return {
      document,
      score,
      matchType: "bm25",
      matchDetails: { termFreqs, docLength, terms }
    };
  }
}

// 4. Fuzzy Search (Нечіткий пошук)
export class FuzzySearchStrategy implements SearchStrategy {
  name = "fuzzy";
  description = "Fuzzy search with error tolerance";

  private docRepository = AppDataSource.getRepository(Document);

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 10, technology, type, fuzzyThreshold = 0.6 } = options;
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const documents = await this.getDocuments(technology, type);
    const results: SearchResult[] = [];

    for (const doc of documents) {
      const docText = (doc.title + " " + doc.content).toLowerCase();
      const docWords = docText.split(/\s+/);
      
      let totalScore = 0;
      const matches: Array<{query: string, match: string, score: number}> = [];
      
      for (const queryWord of queryWords) {
        let bestMatch = { word: "", score: 0 };
        
        for (const docWord of docWords) {
          const similarity = this.calculateSimilarity(queryWord, docWord);
          if (similarity > bestMatch.score && similarity >= fuzzyThreshold) {
            bestMatch = { word: docWord, score: similarity };
          }
        }
        
        if (bestMatch.score > 0) {
          totalScore += bestMatch.score;
          matches.push({
            query: queryWord,
            match: bestMatch.word,
            score: bestMatch.score
          });
        }
      }

      if (totalScore > 0) {
        results.push({
          document: doc,
          score: totalScore / queryWords.length, // Нормалізація
          matchType: "fuzzy",
          matchDetails: { matches, threshold: fuzzyThreshold }
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getDocuments(technology?: string, type?: string): Promise<Document[]> {
    const queryBuilder = this.docRepository.createQueryBuilder("doc");
    
    if (technology) {
      queryBuilder.where("doc.technology = :technology", { technology });
    }
    
    if (type) {
      queryBuilder.andWhere("doc.type = :type", { type });
    }

    return queryBuilder.getMany();
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length < 2 || str2.length < 2) return 0;
    
    // Levenshtein distance
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (matrix[str2.length][str1.length] / maxLength);
  }
}

// 5. N-gram Search
export class NGramSearchStrategy implements SearchStrategy {
  name = "ngram";
  description = "N-gram search for partial matches";

  private docRepository = AppDataSource.getRepository(Document);

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 10, technology, type } = options;
    const ngramSize = 3; // тріграми
    const queryNgrams = this.generateNgrams(query.toLowerCase(), ngramSize);
    
    const documents = await this.getDocuments(technology, type);
    const results: SearchResult[] = [];

    for (const doc of documents) {
      const docText = (doc.title + " " + doc.content).toLowerCase();
      const docNgrams = this.generateNgrams(docText, ngramSize);
      
      const commonNgrams = queryNgrams.filter(ngram => docNgrams.includes(ngram));
      const score = commonNgrams.length / Math.max(queryNgrams.length, 1);
      
      if (score > 0) {
        results.push({
          document: doc,
          score,
          matchType: "ngram",
          matchDetails: { 
            commonNgrams: commonNgrams.length,
            totalQueryNgrams: queryNgrams.length,
            ngramSize 
          }
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getDocuments(technology?: string, type?: string): Promise<Document[]> {
    const queryBuilder = this.docRepository.createQueryBuilder("doc");
    
    if (technology) {
      queryBuilder.where("doc.technology = :technology", { technology });
    }
    
    if (type) {
      queryBuilder.andWhere("doc.type = :type", { type });
    }

    return queryBuilder.getMany();
  }

  private generateNgrams(text: string, n: number): string[] {
    const ngrams: string[] = [];
    const cleanText = text.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
    
    for (let i = 0; i <= cleanText.length - n; i++) {
      ngrams.push(cleanText.substring(i, i + n));
    }
    
    return [...new Set(ngrams)]; // унікальні n-грами
  }
}

// 6. Rule-Based Search (Пошук на основі правил)
export class RuleBasedSearchStrategy implements SearchStrategy {
  name = "rule_based";
  description = "Rule-based search with patterns";

  private docRepository = AppDataSource.getRepository(Document);

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 10, technology, type } = options;
    const documents = await this.getDocuments(technology, type);
    const results: SearchResult[] = [];

    for (const doc of documents) {
      const score = this.applyRules(query, doc);
      
      if (score > 0) {
        results.push({
          document: doc,
          score,
          matchType: "rule_based",
          matchDetails: { appliedRules: this.getAppliedRules(query, doc) }
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getDocuments(technology?: string, type?: string): Promise<Document[]> {
    const queryBuilder = this.docRepository.createQueryBuilder("doc");
    
    if (technology) {
      queryBuilder.where("doc.technology = :technology", { technology });
    }
    
    if (type) {
      queryBuilder.andWhere("doc.type = :type", { type });
    }

    return queryBuilder.getMany();
  }

  private applyRules(query: string, document: Document): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const title = document.title.toLowerCase();
    const content = document.content.toLowerCase();

    // Правило 1: Точний збіг заголовка
    if (title.includes(lowerQuery)) {
      score += 10;
    }

    // Правило 2: Збіг у перших 100 символах (початок документа)
    if (content.substring(0, 100).includes(lowerQuery)) {
      score += 8;
    }

    // Правило 3: Кількість упоминань
    const mentions = (content.match(new RegExp(lowerQuery, 'g')) || []).length;
    score += Math.min(mentions * 2, 10); // максимум 10 балів

    // Правило 4: Збіг типу документа з запитом
    if (lowerQuery.includes('error') && document.type === 'issue') {
      score += 5;
    }

    if (lowerQuery.includes('guide') && document.type === 'documentation') {
      score += 5;
    }

    // Правило 5: Технологічний контекст
    if (lowerQuery.includes(document.technology)) {
      score += 3;
    }

    return score;
  }

  private getAppliedRules(query: string, document: Document): string[] {
    const rules: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    if (document.title.toLowerCase().includes(lowerQuery)) {
      rules.push("exact_title_match");
    }
    
    if (document.content.substring(0, 100).toLowerCase().includes(lowerQuery)) {
      rules.push("early_content_match");
    }
    
    if (lowerQuery.includes('error') && document.type === 'issue') {
      rules.push("error_type_match");
    }
    
    return rules;
  }
} 