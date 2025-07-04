/**
 * AI Models Demonstration Script
 * 
 * This script demonstrates how to use different AI models in your project.
 * Run with: ts-node src/examples/ai-models-demo.ts
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AIModelFactory, AIProvider, ModelType } from '../ai/model-factory';
import { AIConfigService } from '../ai/ai-config.service';
import { createQAChain } from '../ai/chain';
import { ImageAnalysisService } from '../services/image-analysis.service';

// Load environment variables
dotenv.config();

async function demonstrateModelFactory() {
  console.log('\n🤖 AI Model Factory Demo');
  console.log('========================');

  // Get available models
  const availableModels = AIModelFactory.getAvailableModels();
  console.log('Available models:', JSON.stringify(availableModels, null, 2));

  // Show free models specifically
  const freeModels = AIModelFactory.getFreeModels();
  console.log('\n🆓 FREE Models:', JSON.stringify(freeModels, null, 2));

  // Create different models
  try {
    // Try free models first
    if (process.env.GROQ_API_KEY) {
      console.log('\n1. Creating FREE Groq Llama 3.1 70B model...');
      const groqModel = AIModelFactory.createChatModel({
        provider: AIProvider.GROQ,
        modelName: "llama-3.3-70b-versatile",
        temperature: 0.2,
        maxTokens: 100
      });
      console.log('✅ Groq model created successfully (FREE!)');
    } else {
      console.log('\n1. ⚠️  Groq API key not found. Get FREE key at https://console.groq.com/keys');
    }

    if (process.env.GOOGLE_API_KEY) {
      console.log('\n2. Creating FREE Google Gemini model...');
      const googleModel = AIModelFactory.createChatModel({
        provider: AIProvider.GOOGLE,
        modelName: "gemini-1.5-flash",
        temperature: 0.3,
        maxTokens: 100
      });
      console.log('✅ Google Gemini model created successfully (FREE!)');
    } else {
      console.log('\n2. ⚠️  Google API key not found. Get FREE key at https://aistudio.google.com/app/apikey');
    }

    console.log('\n3. Creating OpenAI GPT-4 Turbo model...');
    const openAIModel = AIModelFactory.createChatModel({
      provider: AIProvider.OPENAI,
      modelName: "gpt-4-turbo",
      temperature: 0.3,
      maxTokens: 100
    });
    console.log('✅ OpenAI model created successfully');

    if (process.env.ANTHROPIC_API_KEY) {
      console.log('\n4. Creating Anthropic Claude model...');
      const claudeModel = AIModelFactory.createChatModel({
        provider: AIProvider.ANTHROPIC,
        modelName: "claude-3-5-sonnet-20241022",
        temperature: 0.3,
        maxTokens: 100
      });
      console.log('✅ Anthropic model created successfully');
    } else {
      console.log('\n4. ⚠️  Anthropic API key not found, skipping Claude demo');
    }

  } catch (error) {
    console.error('❌ Error creating models:', error instanceof Error ? error.message : error);
  }
}

async function demonstrateConfigService() {
  console.log('\n🔧 AI Config Service Demo');
  console.log('==========================');

  const aiConfig = AIConfigService.getInstance();

  // Get current configuration
  const config = aiConfig.getConfig();
  console.log('Current config:', JSON.stringify(config, null, 2));

  // Get available providers
  const providers = aiConfig.getAvailableProviders();
  console.log('\nAvailable providers:', providers);

  // Get recommendations for different tasks
  const tasks = ['reasoning', 'vision', 'speed', 'cost-effective'] as const;
  console.log('\nTask recommendations:');
  
  for (const task of tasks) {
    const recommendation = aiConfig.getModelRecommendation(task);
    console.log(`  ${task}: ${recommendation.provider}/${recommendation.modelName}`);
    console.log(`    Reason: ${recommendation.reason}`);
  }
}

async function demonstrateTextGeneration() {
  console.log('\n💬 Text Generation Demo');
  console.log('========================');

  try {
    // Test with FREE models first
    if (process.env.GROQ_API_KEY) {
      console.log('\n1. Using FREE Groq Llama 3.1 70B model...');
      const groqChain = await createQAChain('typescript', {
        provider: AIProvider.GROQ,
        modelName: "llama-3.3-70b-versatile",
        temperature: 0.1
      });
      const groqResponse = await groqChain.call({
        question: "What is TypeScript?"
      });
      console.log('Groq (FREE) response:', groqResponse.text.slice(0, 200) + '...');
    }

    if (process.env.GOOGLE_API_KEY) {
      console.log('\n2. Using FREE Google Gemini model...');
      const googleChain = await createQAChain('typescript', {
        provider: AIProvider.GOOGLE,
        modelName: "gemini-1.5-flash",
        temperature: 0.1
      });
      const googleResponse = await googleChain.call({
        question: "What is TypeScript?"
      });
      console.log('Google Gemini (FREE) response:', googleResponse.text.slice(0, 200) + '...');
    }

    // Test with default configuration (might be free if configured)
    console.log('\n3. Using default model...');
    const defaultChain = await createQAChain('typescript');
    const defaultResponse = await defaultChain.call({
      question: "What is TypeScript?"
    });
    console.log('Default model response:', defaultResponse.text.slice(0, 200) + '...');

    // Test with paid models if available
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('\n4. Using Claude model (PAID)...');
      const claudeChain = await createQAChain('typescript', {
        provider: AIProvider.ANTHROPIC,
        modelName: "claude-3-5-sonnet-20241022",
        temperature: 0.1
      });
      const claudeResponse = await claudeChain.call({
        question: "What is TypeScript?"
      });
      console.log('Claude (PAID) response:', claudeResponse.text.slice(0, 200) + '...');
    }

  } catch (error) {
    console.error('❌ Text generation error:', error instanceof Error ? error.message : error);
  }
}

async function demonstrateVisionCapabilities() {
  console.log('\n👁️ Vision Capabilities Demo');
  console.log('=============================');

  // Check vision capabilities
  const openAIVision = AIModelFactory.isVisionCapable(AIProvider.OPENAI, "gpt-4o");
  const claudeVision = AIModelFactory.isVisionCapable(AIProvider.ANTHROPIC, "claude-3-5-sonnet-20241022");
  
  console.log('Vision capabilities:');
  console.log(`  OpenAI GPT-4o: ${openAIVision ? '✅' : '❌'}`);
  console.log(`  Claude 3.5 Sonnet: ${claudeVision ? '✅' : '❌'}`);

  // You would need an actual image file to test vision analysis
  console.log('\nTo test image analysis, use:');
  console.log('const imageService = new ImageAnalysisService({ provider: AIProvider.OPENAI });');
  console.log('const result = await imageService.analyzeImage("/path/to/image.jpg", "What do you see?");');
}

async function demonstrateModelInfo() {
  console.log('\n📊 Model Information Demo');
  console.log('==========================');

  const models = [
    { provider: AIProvider.OPENAI, name: "gpt-4o" },
    { provider: AIProvider.OPENAI, name: "gpt-4-turbo" },
    { provider: AIProvider.ANTHROPIC, name: "claude-3-5-sonnet-20241022" },
  ];

  for (const { provider, name } of models) {
    const info = AIModelFactory.getModelInfo(provider, name);
    if (info) {
      console.log(`\n${provider}/${name}:`);
      console.log(`  Context window: ${info.contextWindow.toLocaleString()} tokens`);
      console.log(`  Strengths: ${info.strengths.join(', ')}`);
      console.log(`  Input cost: $${info.costPer1kTokens.input}/1K tokens`);
      console.log(`  Output cost: $${info.costPer1kTokens.output}/1K tokens`);
    }
  }
}

async function main() {
  console.log('🚀 AI Models Demonstration');
  console.log('===========================');
  
  console.log('\nChecking environment configuration...');
  console.log(`🆓 Groq API Key: ${process.env.GROQ_API_KEY ? '✅ Configured (FREE!)' : '❌ Missing'}`);
  console.log(`🆓 Google API Key: ${process.env.GOOGLE_API_KEY ? '✅ Configured (FREE!)' : '❌ Missing'}`);
  console.log(`💳 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Configured (PAID)' : '❌ Missing'}`);
  console.log(`💳 Anthropic API Key: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured (PAID)' : '❌ Missing'}`);
  console.log(`Default Provider: ${process.env.DEFAULT_AI_PROVIDER || 'openai'}`);

  // Check if any providers are configured
  const hasAnyProvider = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || 
                        process.env.GROQ_API_KEY || process.env.GOOGLE_API_KEY;

  if (!hasAnyProvider) {
    console.log('\n❌ No AI provider API keys found. Get started with FREE options:');
    console.log('🆓 1. Groq (FREE): https://console.groq.com/keys');
    console.log('🆓 2. Google AI Studio (FREE): https://aistudio.google.com/app/apikey');
    console.log('💳 3. OpenAI (PAID): https://platform.openai.com/api-keys');
    console.log('💳 4. Anthropic (PAID): https://console.anthropic.com/');
    console.log('\nAdd any API key to your .env file to get started!');
    return;
  }

  // Show setup recommendations
  if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.log('\n💡 TIP: Get FREE API keys for better cost efficiency:');
    console.log('🆓 Groq: https://console.groq.com/keys (Llama 3.1 70B - excellent reasoning)');
    console.log('🆓 Google: https://aistudio.google.com/app/apikey (Gemini 1.5 Flash - great vision)');
  }

  try {
    await demonstrateModelFactory();
    await demonstrateConfigService();
    await demonstrateTextGeneration();
    await demonstrateVisionCapabilities();
    await demonstrateModelInfo();

    console.log('\n✅ Demonstration completed successfully!');
    console.log('\nNext steps:');
    console.log('🆓 1. Try FREE models: Set GROQ_API_KEY or GOOGLE_API_KEY in .env');
    console.log('💳 2. Configure paid providers for premium features');
    console.log('🔧 3. Use the GraphQL API with model selection parameters');
    console.log('🚀 4. Implement custom chains with specific models for different tasks');
    
  } catch (error) {
    console.error('\n❌ Demonstration failed:', error instanceof Error ? error.message : error);
  }
}

// Run the demonstration
if (require.main === module) {
  main().catch(console.error);
}

export { main as runAIModelsDemo }; 