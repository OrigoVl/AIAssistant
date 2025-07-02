import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export class ImageAnalysisService {
  private chatModel: ChatOpenAI;

  constructor() {
    this.chatModel = new ChatOpenAI({
      modelName: "gpt-4o",
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 1000,
    });
  }

  async analyzeImage(
    imagePath: string,
    question: string,
    technology?: string
  ): Promise<{ 
    answer: string; 
    imageDescription: string; 
    extractedText?: string;
  }> {
    try {
      // Convert image to base64
      const imageBuffer = await this.processImage(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Create prompts for different types of analysis
      const descriptionPrompt = this.createDescriptionPrompt(technology);
      const analysisPrompt = this.createAnalysisPrompt(question, technology);

      // Analyze image with OpenAI Vision using LangChain
      const imageDescription = await this.callVisionWithLangChain(base64Image, descriptionPrompt);
      const answer = await this.callVisionWithLangChain(base64Image, analysisPrompt);

      // Try to extract text if the image contains code/text
      let extractedText: string | undefined;
      if (this.mightContainText(imageDescription)) {
        extractedText = await this.extractText(base64Image);
      }

      return {
        answer: answer.trim(),
        imageDescription: imageDescription.trim(),
        extractedText: extractedText?.trim(),
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image');
    }
  }

  private async processImage(imagePath: string): Promise<Buffer> {
    try {
      // Optimize image size and quality for API
      return await sharp(imagePath)
        .resize(2048, 2048, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (error) {
      // If sharp processing fails, read file directly
      return fs.readFileSync(imagePath);
    }
  }

  private createDescriptionPrompt(technology?: string): string {
    const techContext = technology 
      ? ` з фокусом на ${technology}` 
      : '';
    
    return `Детально опиши це зображення${techContext}. 
    Сконцентруйся на технічних деталях, коді, діаграмах, UI елементах, помилках або будь-яких важливих деталях.
    Відповідай українською мовою.`;
  }

  private createAnalysisPrompt(question: string, technology?: string): string {
    const techContext = technology 
      ? ` Контекст технології: ${technology}.` 
      : '';
    
    return `${techContext}
    Питання користувача: ${question}
    
    Проаналізуй це зображення та дай детальну відповідь на питання користувача.
    Якщо на зображенні є код, поясни його.
    Якщо це UI, опиши його функціональність.
    Якщо це помилка, запропонуй рішення.
    Якщо це діаграма, поясни її зміст.
    
    Відповідай українською мовою та будь конкретним і корисним.`;
  }

  private async callVisionWithLangChain(base64Image: string, prompt: string): Promise<string> {
    try {
      const message = new HumanMessage({
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: "high"
            },
          },
        ],
      });

      const response = await this.chatModel.invoke([message]);
      return response.content as string || 'Не вдалося отримати відповідь';
    } catch (error) {
      console.error('LangChain Vision API error:', error);
      // Fallback to direct API call if LangChain fails
      return await this.callVisionAPI(base64Image, prompt);
    }
  }

  private async callVisionAPI(base64Image: string, prompt: string): Promise<string> {
    try {
      // Fallback direct API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
        error?: any;
      };
      
      if (result.error) {
        console.error('OpenAI API Error:', result.error);
        throw new Error(`OpenAI Error: ${result.error.message || JSON.stringify(result.error)}`);
      }
      
      return result.choices?.[0]?.message?.content || 'Не вдалося отримати відповідь';
    } catch (error) {
      console.error('Vision API error:', error);
      return `Помилка при аналізі зображення: ${error instanceof Error ? error.message : 'Невідома помилка'}`;
    }
  }

  private mightContainText(description: string): boolean {
    const textIndicators = [
      'код', 'code', 'текст', 'text', 'написано', 'програма', 'script',
      'консоль', 'terminal', 'помилка', 'error', 'exception'
    ];
    return textIndicators.some(indicator => 
      description.toLowerCase().includes(indicator)
    );
  }

  private async extractText(base64Image: string): Promise<string> {
    const prompt = `Витягни весь текст з цього зображення. 
    Якщо це код, збережи форматування.
    Якщо це звичайний текст, витягни його як є.
    Поверни тільки сам текст без додаткових коментарів.`;
    
    return await this.callVisionWithLangChain(base64Image, prompt);
  }

  async cleanup(imagePath: string): Promise<void> {
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      console.error('Error cleaning up image:', error);
    }
  }
} 