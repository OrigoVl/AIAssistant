import { Resolver, Mutation, Arg } from "type-graphql";
import { ImageAnalysis } from "../types/image-analysis.type";
import { ImageAnalysisService } from "../services/image-analysis.service";
import { createQAChain } from "../ai/chain";
import { AIProvider } from "../ai/model-factory";
import * as fs from 'fs';
import * as path from 'path';

@Resolver()
export class ImageResolver {
  @Mutation(() => ImageAnalysis)
  async analyzeImage(
    @Arg("imageUrl") imageUrl: string,
    @Arg("question") question: string,
    @Arg("technology", { nullable: true }) technology?: string,
    @Arg("provider", { nullable: true }) provider?: string,
    @Arg("modelName", { nullable: true }) modelName?: string,
    @Arg("temperature", { nullable: true }) temperature?: number,
    @Arg("maxTokens", { nullable: true }) maxTokens?: number
  ): Promise<ImageAnalysis> {
    try {
      // Check if file exists
      if (!fs.existsSync(imageUrl)) {
        throw new Error('Image file not found');
      }

      // Create image analysis service with specified options
      const analysisOptions = {
        ...(provider && { provider: provider as AIProvider }),
        ...(modelName && { modelName }),
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens !== undefined && { maxTokens }),
      };

      const imageAnalysisService = new ImageAnalysisService(analysisOptions);

      // Analyze image with AI
      const analysisResult = await imageAnalysisService.analyzeImage(
        imageUrl,
        question,
        technology
      );

      // Get additional context from our knowledge base if technology is specified
      let sources: any[] = [];
      if (technology && question) {
        try {
          const chainOptions = {
            ...(provider && { provider: provider as AIProvider }),
            ...(modelName && { modelName }),
            ...(temperature !== undefined && { temperature }),
            ...(maxTokens !== undefined && { maxTokens }),
          };

          const chain = await createQAChain(technology.toLowerCase(), chainOptions);
          const contextQuery = `${question} ${analysisResult.imageDescription}`;
          const contextResponse = await chain.call({ question: contextQuery });
          
          sources = contextResponse.sourceDocuments?.map((doc: any) => ({
            content: doc.pageContent,
            source: doc.metadata.source,
            score: doc.metadata.relevanceScore || 0,
          })) || [];
        } catch (contextError) {
          console.warn('Could not get additional context:', contextError);
        }
      }

      // Clean up uploaded file after analysis
      setTimeout(() => {
        imageAnalysisService.cleanup(imageUrl);
      }, 5000); // 5 second delay to allow for any additional processing

      return {
        answer: analysisResult.answer,
        imageDescription: analysisResult.imageDescription,
        extractedText: analysisResult.extractedText,
        sources,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to analyze image: ${errorMessage}`);
    }
  }
} 