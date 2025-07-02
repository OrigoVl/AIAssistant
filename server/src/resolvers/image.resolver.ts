import { Resolver, Mutation, Arg } from "type-graphql";
import { ImageAnalysis } from "../types/image-analysis.type";
import { ImageAnalysisService } from "../services/image-analysis.service";
import { createQAChain } from "../ai/chain";
import * as fs from 'fs';
import * as path from 'path';

@Resolver()
export class ImageResolver {
  private imageAnalysisService: ImageAnalysisService;

  constructor() {
    this.imageAnalysisService = new ImageAnalysisService();
  }

  @Mutation(() => ImageAnalysis)
  async analyzeImage(
    @Arg("imageUrl") imageUrl: string,
    @Arg("question") question: string,
    @Arg("technology", { nullable: true }) technology?: string
  ): Promise<ImageAnalysis> {
    try {
      // Check if file exists
      if (!fs.existsSync(imageUrl)) {
        throw new Error('Image file not found');
      }

      // Analyze image with AI
      const analysisResult = await this.imageAnalysisService.analyzeImage(
        imageUrl,
        question,
        technology
      );

      // Get additional context from our knowledge base if technology is specified
      let sources: any[] = [];
      if (technology && question) {
        try {
          const chain = await createQAChain(technology.toLowerCase());
          const contextQuery = `${question} ${analysisResult.imageDescription}`;
          const contextResponse = await chain.call({ question: contextQuery });
          
          sources = contextResponse.sourceDocuments?.map((doc: any) => ({
            content: doc.pageContent,
            source: doc.metadata.source,
            score: doc.metadata.relevanceScore,
          })) || [];
        } catch (contextError) {
          console.warn('Could not get additional context:', contextError);
        }
      }

      // Clean up uploaded file after analysis
      setTimeout(() => {
        this.imageAnalysisService.cleanup(imageUrl);
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