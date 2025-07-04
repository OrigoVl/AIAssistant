import { AIProvider, ModelType, AIModelFactory } from "./model-factory";

export interface AIConfig {
  textGeneration: {
    provider: AIProvider;
    modelName: string;
    temperature: number;
    maxTokens: number;
  };
  vision: {
    provider: AIProvider;
    modelName: string;
    temperature: number;
    maxTokens: number;
  };
  embedding: {
    provider: AIProvider;
    modelName: string;
  };
}

export class AIConfigService {
  private static instance: AIConfigService;
  private config: AIConfig;

  private constructor() {
    this.config = this.loadDefaultConfig();
  }

  static getInstance(): AIConfigService {
    if (!AIConfigService.instance) {
      AIConfigService.instance = new AIConfigService();
    }
    return AIConfigService.instance;
  }

  private loadDefaultConfig(): AIConfig {
    const defaultProvider = this.getProviderFromEnv();
    
    return {
      textGeneration: {
        provider: defaultProvider,
        modelName: this.getDefaultModel(defaultProvider, ModelType.TEXT_GENERATION),
        temperature: parseFloat(process.env.AI_TEMPERATURE || "0.2"),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || "2000"),
      },
      vision: {
        provider: defaultProvider,
        modelName: this.getDefaultModel(defaultProvider, ModelType.VISION),
        temperature: parseFloat(process.env.AI_VISION_TEMPERATURE || "0.2"),
        maxTokens: parseInt(process.env.AI_VISION_MAX_TOKENS || "1000"),
      },
      embedding: {
        provider: AIProvider.OPENAI, // Always use OpenAI for embeddings for now
        modelName: "text-embedding-3-small",
      },
    };
  }

  private getProviderFromEnv(): AIProvider {
    const envProvider = process.env.DEFAULT_AI_PROVIDER?.toLowerCase();
    
    // Check environment preference first
    if (envProvider === "groq" && process.env.GROQ_API_KEY) {
      return AIProvider.GROQ;
    }
    
    if (envProvider === "google" && process.env.GOOGLE_API_KEY) {
      return AIProvider.GOOGLE;
    }
    
    if (envProvider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      return AIProvider.ANTHROPIC;
    }

    if (envProvider === "openai" && process.env.OPENAI_API_KEY) {
      return AIProvider.OPENAI;
    }

    // Auto-detect available free providers first
    if (process.env.GROQ_API_KEY) {
      return AIProvider.GROQ;
    }

    if (process.env.GOOGLE_API_KEY) {
      return AIProvider.GOOGLE;
    }
    
    // Fall back to paid providers
    if (process.env.ANTHROPIC_API_KEY) {
      return AIProvider.ANTHROPIC;
    }
    
    return AIProvider.OPENAI;
  }

  private getDefaultModel(provider: AIProvider, modelType: ModelType): string {
    const defaultModels: Record<AIProvider, Record<ModelType, string>> = {
      [AIProvider.OPENAI]: {
        [ModelType.TEXT_GENERATION]: "gpt-4-turbo",
        [ModelType.VISION]: "gpt-4o",
        [ModelType.EMBEDDING]: "text-embedding-3-small",
      },
      [AIProvider.ANTHROPIC]: {
        [ModelType.TEXT_GENERATION]: "claude-3-5-sonnet-20241022",
        [ModelType.VISION]: "claude-3-5-sonnet-20241022",
        [ModelType.EMBEDDING]: "text-embedding-3-small", // Fallback to OpenAI
      },
      [AIProvider.GROQ]: {
        [ModelType.TEXT_GENERATION]: "llama-3.3-70b-versatile",
        [ModelType.VISION]: "llama-3.2-11b-vision-preview",
        [ModelType.EMBEDDING]: "text-embedding-3-small", // Fallback to OpenAI
      },
      [AIProvider.GOOGLE]: {
        [ModelType.TEXT_GENERATION]: "gemini-1.5-flash",
        [ModelType.VISION]: "gemini-1.5-flash",
        [ModelType.EMBEDDING]: "text-embedding-3-small", // Fallback to OpenAI
      },
    };

    return defaultModels[provider][modelType];
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  updateTextGenerationConfig(updates: Partial<AIConfig['textGeneration']>): void {
    this.config.textGeneration = { ...this.config.textGeneration, ...updates };
  }

  updateVisionConfig(updates: Partial<AIConfig['vision']>): void {
    this.config.vision = { ...this.config.vision, ...updates };
  }

  updateEmbeddingConfig(updates: Partial<AIConfig['embedding']>): void {
    this.config.embedding = { ...this.config.embedding, ...updates };
  }

  getTextGenerationOptions() {
    return {
      provider: this.config.textGeneration.provider,
      modelName: this.config.textGeneration.modelName,
      temperature: this.config.textGeneration.temperature,
      maxTokens: this.config.textGeneration.maxTokens,
    };
  }

  getVisionOptions() {
    return {
      provider: this.config.vision.provider,
      modelName: this.config.vision.modelName,
      temperature: this.config.vision.temperature,
      maxTokens: this.config.vision.maxTokens,
    };
  }

  getEmbeddingOptions() {
    return {
      provider: this.config.embedding.provider,
      modelName: this.config.embedding.modelName,
    };
  }

  isProviderConfigured(provider: AIProvider): boolean {
    switch (provider) {
      case AIProvider.OPENAI:
        return !!process.env.OPENAI_API_KEY;
      case AIProvider.ANTHROPIC:
        return !!process.env.ANTHROPIC_API_KEY;
      case AIProvider.GROQ:
        return !!process.env.GROQ_API_KEY;
      case AIProvider.GOOGLE:
        return !!process.env.GOOGLE_API_KEY;
      default:
        return false;
    }
  }

  getAvailableProviders(): AIProvider[] {
    return Object.values(AIProvider).filter(provider => 
      this.isProviderConfigured(provider)
    );
  }

  getModelRecommendation(task: 'reasoning' | 'vision' | 'speed' | 'cost-effective'): { provider: AIProvider; modelName: string; reason: string } {
    const recommendations = {
      reasoning: {
        provider: AIProvider.GROQ, // Changed to free option first
        modelName: "llama-3.3-70b-versatile",
        reason: "Llama 3.3 70B provides excellent reasoning capabilities and is completely free via Groq"
      },
      vision: {
        provider: AIProvider.GOOGLE, // Free Google Gemini for vision
        modelName: "gemini-1.5-flash",
        reason: "Gemini 1.5 Flash has excellent vision capabilities with a generous free tier"
      },
      speed: {
        provider: AIProvider.GROQ,
        modelName: "llama-3.1-8b-instant",
        reason: "Llama 3.1 8B Instant provides very fast responses and is completely free"
      },
      'cost-effective': {
        provider: AIProvider.GROQ,
        modelName: "llama-3.1-8b-instant",
        reason: "Llama 3.1 8B via Groq is completely free with good performance"
      }
    };

    const recommendation = recommendations[task];
    
    // Fall back to available provider if recommended one is not configured
    if (!this.isProviderConfigured(recommendation.provider)) {
      const availableProviders = this.getAvailableProviders();
      if (availableProviders.length > 0) {
        const fallbackProvider = availableProviders[0];
        const fallbackModel = this.getDefaultModel(fallbackProvider, ModelType.TEXT_GENERATION);
        return {
          provider: fallbackProvider,
          modelName: fallbackModel,
          reason: `Falling back to ${fallbackProvider} (${fallbackModel}) as recommended provider is not configured`
        };
      }
    }

    return recommendation;
  }
} 