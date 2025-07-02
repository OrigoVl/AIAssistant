import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { AppDataSource } from "../data-source";
import { Document } from "../entities/document.entity";

const UA_TEMPLATE = `Ти експерт з {technology}. Відповідай українською мовою.
Контекст:
{context}

Питання: {question}
Відповідь:`;

export async function createQAChain(technology: string) {
  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-turbo",
    temperature: 0.2,
    maxTokens: 2000,
  });

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
        sourceDocuments: docs
      };
    }
  };
}
