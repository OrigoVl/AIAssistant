import { Query, Resolver, Arg } from "type-graphql";
import { createQAChain } from "../ai/chain";
import { QAAnswer } from "../types/qa-answer.type";

@Resolver()
export class AIResolver {
  @Query(() => QAAnswer)
  async askAI(
    @Arg("question") question: string,
    @Arg("technology") technology: string
  ): Promise<QAAnswer> {
    const chain = await createQAChain(technology.toLowerCase());
    const response = await chain.call({ question });

    return {
      answer: response.text,
      generatedAt: new Date().toISOString(),
      sources: response.sourceDocuments.map((doc: any) => ({
        content: doc.pageContent,
        source: doc.metadata.source,
        score: doc.metadata.relevanceScore,
      })),
    };
  }
}
