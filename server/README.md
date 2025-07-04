# 🤖 AI Assistant - Advanced Multi-Model AI Platform

## 🎯 Overview

Advanced AI Assistant with support for multiple AI providers, search strategies, and code-specific queries. Features **FREE AI models** for development and testing.

## 🆓 FREE AI Models Supported

### Groq Models (Completely Free)
- **llama-3.3-70b-versatile** - Best overall reasoning and code capabilities
- **llama-3.1-8b-instant** - Lightning-fast responses
- **llama-3.2-11b-vision-preview** - Vision and image analysis
- **mixtral-8x7b-32768** - Multilingual support
- **gemma2-9b-it** - General purpose

### Google Gemini Models (Free Tier)
- **gemini-1.5-flash** - 1M context window, multimodal
- **gemini-1.0-pro** - General purpose, reliable

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Required for any AI provider
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# For FREE models, add GROQ_API_KEY or GOOGLE_API_KEY
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_assistant
CHROMA_PATH=./chroma_db

# Optional
DEFAULT_AI_PROVIDER=groq  # Prefer free models
```

### 2. Installation
```bash
npm install
npm run build
npm run dev
```

### 3. Test FREE Models
```bash
npm run demo-ai
```

## 🎯 Features

### 🤖 Multi-Provider AI Support
- **OpenAI**: GPT-4, GPT-4o, GPT-4o-mini
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku
- **Groq**: Llama 3.3 70B, Llama 3.1 8B (FREE)
- **Google**: Gemini 1.5 Pro/Flash (FREE tier)

### 🔍 Advanced Search Strategies
- **Vector Search**: Semantic similarity with ChromaDB
- **Lexical Search**: Exact keyword matching
- **BM25 Algorithm**: Information retrieval ranking
- **Fuzzy Search**: Typo-tolerant matching
- **Hybrid Search**: Combines multiple strategies

### 🎯 Code-Specific Search
- Limited to programming technologies: Vue.js, Node.js, TypeScript, GrapesJS
- Technical query validation with intelligent filtering
- Non-technical query blocking with helpful suggestions

### 🖼️ Image Analysis
- Vision-capable models for code screenshots
- OCR text extraction from images
- UI/UX analysis and suggestions

## 🔧 Configuration

### Default Free Model Setup
```bash
# In your .env file
DEFAULT_AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here # * FREE
```

### Advanced Configuration
```typescript
// Custom model configuration
const customModel = AIModelFactory.createChatModel({
  provider: AIProvider.GROQ,
  modelName: "llama-3.3-70b-versatile",
  temperature: 0.2,
  maxTokens: 1000,
});
```

## 📊 GraphQL API

### Basic Query
```graphql
query {
  askAI(
    question: "How to create a Vue.js component?"
    technology: "vue"
    provider: "groq"
    modelName: "llama-3.3-70b-versatile"
  ) {
    answer
    sources {
      source
      score
    }
  }
}
```

### Technical Query Validation
```graphql
query {
  validateQuery(query: "how to cook pasta") {
    isTechnical
    warning
    suggestions
  }
}
```

### Model Information
```graphql
query {
  getModelInfo(provider: "groq", modelName: "llama-3.3-70b-versatile") {
    isFree
    strengths
    rateLimit
    contextWindow
  }
}
```

## 🔍 Search Capabilities

### Code Search
```graphql
query {
  searchCode(
    query: "Vue component lifecycle"
    technologies: ["vue", "typescript"]
    limit: 10
  ) {
    isTechnical
    results {
      document {
        title
        content
        technology
        source
      }
      score
    }
  }
}
```

### Technology-Specific Search
```graphql
query {
  searchByTechnology(
    technology: "vue"
    query: "reactive data binding"
  ) {
    results {
      document {
        title
        content
      }
      score
    }
  }
}
```

## 🛠️ Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build production version
npm run demo-ai      # Test AI models
npm run search-demo  # Test search strategies
```

### Testing
```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 🎯 Best Practices

### For FREE Model Usage
1. **Start with Groq**: No credit card required, excellent performance
2. **Use appropriate model sizes**: 70B for complex reasoning, 8B for simple tasks
3. **Monitor rate limits**: 30 requests/minute for Groq
4. **Cache responses**: Avoid repeated identical queries

### For Production
1. **Implement retry logic**: Handle rate limits gracefully
2. **Use model recommendations**: Let the system suggest optimal models
3. **Monitor costs**: Track usage across providers
4. **Fallback strategies**: Have backup providers configured

## 🚨 Rate Limits & Costs

| Provider | Model | Requests/min | Cost | Notes |
|----------|-------|--------------|------|-------|
| Groq | llama-3.3-70b-versatile | 30 | FREE | Best free option |
| Groq | llama-3.1-8b-instant | 30 | FREE | Fastest responses |
| Google | gemini-1.5-flash | 15 | FREE | Large context |
| OpenAI | gpt-4o | 500 | $0.005/1k | Production ready |
| Anthropic | claude-3.5-sonnet | 1000 | $0.003/1k | Excellent for writing |

## 🏗️ Architecture

### Core Components
- **AIModelFactory**: Creates and manages AI model instances
- **AIConfigService**: Handles provider configuration and preferences
- **SearchStrategies**: Implements different search algorithms
- **CodeSearchService**: Validates and processes technical queries

### Database Schema
- **documents**: Vector embeddings and metadata
- **searches**: Search history and analytics
- **models**: AI model configurations and stats

## 🎉 Get Started for FREE

1. **Get Groq API Key**: [console.groq.com](https://console.groq.com) (no credit card)
2. **Add to .env**: `GROQ_API_KEY=your_key_here`
3. **Test**: `npm run demo-ai`
4. **Build**: Start creating your AI application!

## 📚 Documentation

- [AI Models Guide](./AI_MODELS_GUIDE.md) - Complete model documentation
- [Free Models Setup](./FREE_MODELS_SETUP.md) - Quick setup for free models
- [Search Approaches](./SEARCH_APPROACHES_COMPARISON.md) - Search strategy comparison
- [Code Search Guide](./CODE_SEARCH_GUIDE.md) - Technical query documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!

---

**💡 Build powerful AI applications without spending a penny using our FREE model integrations!** 