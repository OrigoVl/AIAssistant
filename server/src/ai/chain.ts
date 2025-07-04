import { PromptTemplate } from "@langchain/core/prompts";
import { AppDataSource } from "../data-source";
import { Document } from "../entities/document.entity";
import { AIModelFactory, AIProvider, ModelType, AIModelOptions } from "./model-factory";

const UA_TEMPLATE = `Ти експерт з {technology}. Відповідай українською мовою.
Контекст:
{context}

Питання: {question}
Відповідь:`;

export interface QAChainOptions {
  provider?: AIProvider;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function createQAChain(technology: string, options: QAChainOptions = {}) {
  const modelOptions: AIModelOptions = {
    ...options,
    modelType: ModelType.TEXT_GENERATION,
  };

  const model = AIModelFactory.createChatModel(modelOptions);
  const prompt = PromptTemplate.fromTemplate(UA_TEMPLATE);

  // Simple document retriever without vector store
  const retriever = {
    getRelevantDocuments: async (query: string) => {
      const docRepo = AppDataSource.getRepository(Document);
      const documents = await docRepo
        .createQueryBuilder("doc")
        .where("doc.technology = :technology", { technology })
        .andWhere("doc.title ILIKE :query OR doc.content ILIKE :query", {
          query: `%${query}%`,
        })
        .orderBy("doc.created_at", "DESC")
        .limit(5)
        .getMany();

      return documents.map(doc => ({
        pageContent: doc.content,
        metadata: {
          id: doc.id,
          source: doc.source,
          title: doc.title,
          type: doc.type,
          technology: doc.technology,
        }
      }));
    }
  };

  return {
    call: async ({ question }: { question: string }) => {
      // Get relevant documents
      const docs = await retriever.getRelevantDocuments(question);
      
      // Prepare context from documents
      const context = docs
        .map(doc => `${doc.metadata.title}: ${doc.pageContent.slice(0, 500)}`)
        .join('\n\n');

      // Generate prompt with context
      const formattedPrompt = await prompt.format({
        technology,
        context,
        question,
      });

      // Get AI response
      const response = await model.invoke(formattedPrompt);
      
      return {
        text: typeof response.content === 'string' ? response.content : response.content.toString(),
        sourceDocuments: docs,
        modelInfo: {
          provider: options.provider || process.env.DEFAULT_AI_PROVIDER || 'openai',
          model: options.modelName || 'default',
        }
      };
    }
  };
}
