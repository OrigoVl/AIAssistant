import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export enum AIProvider {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GROQ = "groq",
  GOOGLE = "google",
}

export enum ModelType {
  TEXT_GENERATION = "text_generation",
  VISION = "vision", 
  EMBEDDING = "embedding",
}

export interface ModelConfig {
  provider: AIProvider;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  isFree?: boolean;
}

export interface AIModelOptions {
  provider?: AIProvider;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  modelType?: ModelType;
}

export class AIModelFactory {
  private static readonly DEFAULT_CONFIGS: Record<AIProvider, Record<ModelType, ModelConfig>> = {
    [AIProvider.OPENAI]: {
      [ModelType.TEXT_GENERATION]: {
        provider: AIProvider.OPENAI,
        modelName: "gpt-4-turbo",
        temperature: 0.2,
        maxTokens: 2000,
        isFree: false,
      },
      [ModelType.VISION]: {
        provider: AIProvider.OPENAI,
        modelName: "gpt-4o",
        temperature: 0.2,
        maxTokens: 1000,
        isFree: false,
      },
      [ModelType.EMBEDDING]: {
        provider: AIProvider.OPENAI,
        modelName: "text-embedding-3-small",
        isFree: false,
      },
    },
    [AIProvider.ANTHROPIC]: {
      [ModelType.TEXT_GENERATION]: {
        provider: AIProvider.ANTHROPIC,
        modelName: "claude-3-5-sonnet-20241022",
        temperature: 0.2,
        maxTokens: 2000,
        isFree: false,
      },
      [ModelType.VISION]: {
        provider: AIProvider.ANTHROPIC,
        modelName: "claude-3-5-sonnet-20241022",
        temperature: 0.2,
        maxTokens: 1000,
        isFree: false,
      },
      [ModelType.EMBEDDING]: {
        provider: AIProvider.OPENAI, // Anthropic doesn't have embeddings, fallback to OpenAI
        modelName: "text-embedding-3-small",
        isFree: false,
      },
    },
    [AIProvider.GROQ]: {
      [ModelType.TEXT_GENERATION]: {
        provider: AIProvider.GROQ,
        modelName: "llama-3.3-70b-versatile",
        temperature: 0.2,
        maxTokens: 2000,
        isFree: true,
      },
      [ModelType.VISION]: {
        provider: AIProvider.GROQ,
        modelName: "llama-3.2-11b-vision-preview",
        temperature: 0.2,
        maxTokens: 1000,
        isFree: true,
      },
      [ModelType.EMBEDDING]: {
        provider: AIProvider.OPENAI, // Groq doesn't have embeddings, fallback to OpenAI
        modelName: "text-embedding-3-small",
        isFree: false,
      },
    },
    [AIProvider.GOOGLE]: {
      [ModelType.TEXT_GENERATION]: {
        provider: AIProvider.GOOGLE,
        modelName: "gemini-1.5-flash",
        temperature: 0.2,
        maxTokens: 2000,
        isFree: true,
      },
      [ModelType.VISION]: {
        provider: AIProvider.GOOGLE,
        modelName: "gemini-1.5-flash",
        temperature: 0.2,
        maxTokens: 1000,
        isFree: true,
      },
      [ModelType.EMBEDDING]: {
        provider: AIProvider.OPENAI, // Google embeddings require different setup, fallback to OpenAI
        modelName: "text-embedding-3-small",
        isFree: false,
      },
    },
  };

  static createChatModel(options: AIModelOptions = {}): BaseChatModel {
    const {
      provider = this.getDefaultProvider(),
      modelType = ModelType.TEXT_GENERATION,
      temperature,
      maxTokens,
      modelName,
    } = options;

    const baseConfig = this.DEFAULT_CONFIGS[provider][modelType];
    
    const config: ModelConfig = {
      ...baseConfig,
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { maxTokens }),
      ...(modelName && { modelName }),
    };

    switch (provider) {
      case AIProvider.OPENAI:
        return new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: config.modelName,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        });

      case AIProvider.ANTHROPIC:
        return new ChatAnthropic({
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
          modelName: config.modelName,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        });

      case AIProvider.GROQ:
        return new ChatGroq({
          apiKey: process.env.GROQ_API_KEY,
          model: config.modelName,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        });

      case AIProvider.GOOGLE:
        return new ChatGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_API_KEY,
          model: config.modelName,
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        });

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  static getAvailableModels(): Record<AIProvider, string[]> {
    return {
      [AIProvider.OPENAI]: [
        "gpt-4-turbo",
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-3.5-turbo",
      ],
      [AIProvider.ANTHROPIC]: [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
      ],
      [AIProvider.GROQ]: [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama-3.2-11b-vision-preview",
        "llama-3.2-3b-preview",
        "llama-3.2-1b-preview",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
        "gemma-7b-it",
      ],
      [AIProvider.GOOGLE]: [
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.0-pro",
      ],
    };
  }

  static isVisionCapable(provider: AIProvider, modelName: string): boolean {
    const visionModels: Record<AIProvider, string[]> = {
      [AIProvider.OPENAI]: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
      [AIProvider.ANTHROPIC]: [
        "claude-3-5-sonnet-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
      ],
      [AIProvider.GROQ]: [
        "llama-3.2-11b-vision-preview",
      ],
      [AIProvider.GOOGLE]: [
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.0-pro",
      ],
    };

    return visionModels[provider]?.includes(modelName) || false;
  }

  static isFreeModel(provider: AIProvider, modelName: string): boolean {
    const freeModels: Record<AIProvider, string[]> = {
      [AIProvider.OPENAI]: [], // No completely free models
      [AIProvider.ANTHROPIC]: [], // No completely free models
      [AIProvider.GROQ]: [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama-3.2-11b-vision-preview",
        "llama-3.2-3b-preview",
        "llama-3.2-1b-preview",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
        "gemma-7b-it",
      ],
      [AIProvider.GOOGLE]: [
        "gemini-1.5-flash", // Has generous free tier
        "gemini-1.0-pro", // Has free tier
      ],
    };

    return freeModels[provider]?.includes(modelName) || false;
  }

  private static getDefaultProvider(): AIProvider {
    const envProvider = process.env.DEFAULT_AI_PROVIDER?.toLowerCase();
    
    // Prefer free providers if no paid ones are configured
    if (envProvider === "groq" && process.env.GROQ_API_KEY) {
      return AIProvider.GROQ;
    }
    
    if (envProvider === "google" && process.env.GOOGLE_API_KEY) {
      return AIProvider.GOOGLE;
    }
    
    if (envProvider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      return AIProvider.ANTHROPIC;
    }

    // Check for any available free provider
    if (process.env.GROQ_API_KEY) {
      return AIProvider.GROQ;
    }

    if (process.env.GOOGLE_API_KEY) {
      return AIProvider.GOOGLE;
    }
    
    return AIProvider.OPENAI;
  }

  static getModelInfo(provider: AIProvider, modelName: string) {
    const modelInfo: Record<AIProvider, Record<string, any>> = {
      [AIProvider.OPENAI]: {
        "gpt-4-turbo": { 
          contextWindow: 128000, 
          strengths: ["Reasoning", "Code", "Math"],
          costPer1kTokens: { input: 0.01, output: 0.03 },
          isFree: false
        },
        "gpt-4o": { 
          contextWindow: 128000, 
          strengths: ["Vision", "Multimodal", "Fast"],
          costPer1kTokens: { input: 0.005, output: 0.015 },
          isFree: false
        },
        "gpt-4o-mini": { 
          contextWindow: 128000, 
          strengths: ["Fast", "Affordable", "Vision"],
          costPer1kTokens: { input: 0.00015, output: 0.0006 },
          isFree: false
        },
      },
      [AIProvider.ANTHROPIC]: {
        "claude-3-5-sonnet-20241022": { 
          contextWindow: 200000, 
          strengths: ["Writing", "Analysis", "Code", "Vision"],
          costPer1kTokens: { input: 0.003, output: 0.015 },
          isFree: false
        },
        "claude-3-5-haiku-20241022": { 
          contextWindow: 200000, 
          strengths: ["Speed", "Efficiency"],
          costPer1kTokens: { input: 0.0008, output: 0.004 },
          isFree: false
        },
      },
      [AIProvider.GROQ]: {
        "llama-3.3-70b-versatile": {
          contextWindow: 32768,
          strengths: ["Reasoning", "Code", "Free"],
          costPer1kTokens: { input: 0, output: 0 },
          isFree: true,
          rateLimit: "30 requests/minute"
        },
        "llama-3.1-8b-instant": {
          contextWindow: 32768,
          strengths: ["Speed", "Efficiency", "Free"],
          costPer1kTokens: { input: 0, output: 0 },
          isFree: true,
          rateLimit: "30 requests/minute"
        },
        "llama-3.2-11b-vision-preview": {
          contextWindow: 8192,
          strengths: ["Vision", "Fast", "Free"],
          costPer1kTokens: { input: 0, output: 0 },
          isFree: true,
          rateLimit: "30 requests/minute"
        },
        "mixtral-8x7b-32768": {
          contextWindow: 32768,
          strengths: ["Reasoning", "Multilingual", "Free"],
          costPer1kTokens: { input: 0, output: 0 },
          isFree: true,
          rateLimit: "30 requests/minute"
        },
      },
      [AIProvider.GOOGLE]: {
        "gemini-1.5-flash": {
          contextWindow: 1000000,
          strengths: ["Speed", "Multimodal", "Large Context", "Free Tier"],
          costPer1kTokens: { input: 0, output: 0 }, // Free tier
          isFree: true,
          rateLimit: "15 requests/minute (free tier)"
        },
        "gemini-1.5-pro": {
          contextWindow: 2000000,
          strengths: ["Advanced Reasoning", "Multimodal", "Huge Context"],
          costPer1kTokens: { input: 0.00125, output: 0.005 },
          isFree: false
        },
        "gemini-1.0-pro": {
          contextWindow: 32768,
          strengths: ["General Purpose", "Free Tier"],
          costPer1kTokens: { input: 0, output: 0 }, // Free tier
          isFree: true,
          rateLimit: "60 requests/minute (free tier)"
        },
      },
    };

    return modelInfo[provider]?.[modelName] || null;
  }

  static getFreeModels(): Record<AIProvider, string[]> {
    const allModels = this.getAvailableModels();
    const freeModels: Partial<Record<AIProvider, string[]>> = {};

    for (const [provider, models] of Object.entries(allModels)) {
      freeModels[provider as AIProvider] = models.filter(model =>
        this.isFreeModel(provider as AIProvider, model)
      );
    }

    return freeModels as Record<AIProvider, string[]>;
  }

  static getProviderSetupInstructions(provider: AIProvider): string {
    const instructions: Record<AIProvider, string> = {
      [AIProvider.OPENAI]: "Get your API key from https://platform.openai.com/api-keys",
      [AIProvider.ANTHROPIC]: "Get your API key from https://console.anthropic.com/",
      [AIProvider.GROQ]: "Get your FREE API key from https://console.groq.com/keys (No credit card required)",
      [AIProvider.GOOGLE]: "Get your FREE API key from https://aistudio.google.com/app/apikey (No credit card required)",
    };

    return instructions[provider] || "Unknown provider";
  }
} 