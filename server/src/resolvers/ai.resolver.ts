import { Query, Resolver, Arg, ObjectType, Field } from "type-graphql";
import { createQAChain } from "../ai/chain";
import { QAAnswer } from "../types/qa-answer.type";
import { AIProvider, AIModelFactory } from "../ai/model-factory";
import { AIConfigService } from "../ai/ai-config.service";
import { CodeSearchService } from "../search/code-search.service";

@ObjectType()
export class ModelInfo {
  @Field()
  provider: string;

  @Field()
  modelName: string;

  @Field({ nullable: true })
  contextWindow?: number;

  @Field(() => [String], { nullable: true })
  strengths?: string[];

  @Field({ nullable: true })
  inputCostPer1kTokens?: number;

  @Field({ nullable: true })
  outputCostPer1kTokens?: number;

  @Field({ nullable: true })
  isFree?: boolean;

  @Field({ nullable: true })
  rateLimit?: string;
}

@ObjectType()
export class AIProviderInfo {
  @Field()
  provider: string;

  @Field(() => [String])
  availableModels: string[];

  @Field()
  isConfigured: boolean;

  @Field({ nullable: true })
  setupInstructions?: string;

  @Field(() => [String])
  freeModels: string[];
}

@Resolver()
export class AIResolver {
  private aiConfig = AIConfigService.getInstance();
  private codeSearchService = new CodeSearchService();

  @Query(() => QAAnswer)
  async askAI(
    @Arg("question") question: string,
    @Arg("technology") technology: string,
    @Arg("provider", { nullable: true }) provider?: string,
    @Arg("modelName", { nullable: true }) modelName?: string,
    @Arg("temperature", { nullable: true }) temperature?: number,
    @Arg("maxTokens", { nullable: true }) maxTokens?: number,
    @Arg("skipTechnicalValidation", { nullable: true, defaultValue: false }) skipTechnicalValidation?: boolean
  ): Promise<QAAnswer> {
    // Валідація технічності запиту
    const validation = this.codeSearchService.validateQuery(question);
    
    // Якщо запит нетехнічний і валідацію не пропущено
    if (!validation.isTechnical && !skipTechnicalValidation) {
      return {
        answer: "Я спеціалізуюся на технічних питаннях про програмування. Будь ласка, задайте питання про Vue.js, Node.js, TypeScript або GrapesJS.",
        generatedAt: new Date().toISOString(),
        sources: [],
        warning: validation.warning,
        isTechnical: false,
        suggestions: validation.suggestions
      };
    }

    const chainOptions = {
      ...(provider && { provider: provider as AIProvider }),
      ...(modelName && { modelName }),
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { maxTokens }),
    };

    try {
      const chain = await createQAChain(technology.toLowerCase(), chainOptions);
      const response = await chain.call({ question });

      return {
        answer: response.text,
        generatedAt: new Date().toISOString(),
        sources: response.sourceDocuments.map((doc: any) => ({
          content: doc.pageContent,
          source: doc.metadata.source,
          score: doc.metadata.relevanceScore || 0,
        })),
        warning: undefined,
        isTechnical: true,
        suggestions: undefined
      };
    } catch (error) {
      console.error('AI query error:', error);
      
      return {
        answer: `Помилка при обробці запиту: ${error instanceof Error ? error.message : 'Невідома помилка'}. Спробуйте ще раз.`,
        generatedAt: new Date().toISOString(),
        sources: [],
        warning: "Технічна помилка при обробці запиту",
        isTechnical: validation.isTechnical,
        suggestions: ["Спробуйте переформулювати запит", "Перевірте інтернет з'єднання", "Спробуйте пізніше"]
      };
    }
  }

  @Query(() => [AIProviderInfo])
  async getAvailableProviders(): Promise<AIProviderInfo[]> {
    const providers = Object.values(AIProvider);
    const availableModels = AIModelFactory.getAvailableModels();
    const freeModels = AIModelFactory.getFreeModels();

    return providers.map(provider => ({
      provider,
      availableModels: availableModels[provider],
      isConfigured: this.aiConfig.isProviderConfigured(provider),
      setupInstructions: AIModelFactory.getProviderSetupInstructions(provider),
      freeModels: freeModels[provider] || [],
    }));
  }

  @Query(() => ModelInfo, { nullable: true })
  async getModelInfo(
    @Arg("provider") provider: string,
    @Arg("modelName") modelName: string
  ): Promise<ModelInfo | null> {
    const info = AIModelFactory.getModelInfo(provider as AIProvider, modelName);
    
    if (!info) {
      return null;
    }

    return {
      provider,
      modelName,
      contextWindow: info.contextWindow,
      strengths: info.strengths,
      inputCostPer1kTokens: info.costPer1kTokens?.input,
      outputCostPer1kTokens: info.costPer1kTokens?.output,
      isFree: info.isFree,
      rateLimit: info.rateLimit,
    };
  }

  @Query(() => ModelInfo)
  async getRecommendedModel(
    @Arg("task") task: string
  ): Promise<ModelInfo> {
    const validTasks = ['reasoning', 'vision', 'speed', 'cost-effective'] as const;
    const taskType = validTasks.includes(task as any) ? task as typeof validTasks[number] : 'reasoning';
    
    const recommendation = this.aiConfig.getModelRecommendation(taskType);
    const info = AIModelFactory.getModelInfo(recommendation.provider, recommendation.modelName);

    return {
      provider: recommendation.provider,
      modelName: recommendation.modelName,
      contextWindow: info?.contextWindow,
      strengths: info?.strengths,
      inputCostPer1kTokens: info?.costPer1kTokens?.input,
      outputCostPer1kTokens: info?.costPer1kTokens?.output,
      isFree: info?.isFree,
      rateLimit: info?.rateLimit,
    };
  }

  @Query(() => [String])
  async getFreeProviders(): Promise<string[]> {
    const providers = Object.values(AIProvider);
    return providers.filter(provider => {
      const freeModels = AIModelFactory.getFreeModels()[provider];
      return freeModels && freeModels.length > 0;
    });
  }

  @Query(() => String)
  async getProviderSetupInstructions(
    @Arg("provider") provider: string
  ): Promise<string> {
    return AIModelFactory.getProviderSetupInstructions(provider as AIProvider);
  }
}
