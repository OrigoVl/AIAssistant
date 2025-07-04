# 🤖 AI Models Guide

This guide explains how to use different AI models in your AI Assistant project, **including completely FREE options**.

## Overview

Your project now supports multiple AI providers with **FREE and PAID** models:

### 🆓 **FREE Models (No Credit Card Required)**
- **Groq**: Llama 3.1 70B/8B, Mixtral 8x7B, Gemma 7B/2B, Llama 3.2 Vision
- **Google Gemini**: Gemini 1.5 Flash, Gemini 1.0 Pro (generous free tiers)

### 💳 **PAID Models** 
- **OpenAI**: GPT-4 Turbo, GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus

## 🚀 Quick Start with FREE Models

### 1. Get FREE API Keys (No Credit Card Required)

#### Groq (Recommended - Fastest Free Models)
1. Visit https://console.groq.com/keys
2. Sign up with just email
3. Get your FREE API key instantly
4. No credit card required, generous rate limits

#### Google AI Studio
1. Visit https://aistudio.google.com/app/apikey  
2. Sign in with Google account
3. Get your FREE API key
4. Generous free tier with high-quality models

### 2. Configure Your Environment

Add to your `.env` file:
```bash
# FREE Providers (choose one or both)
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Set default to free provider
DEFAULT_AI_PROVIDER=groq
```

### 3. Start Using FREE Models Immediately!

```graphql
query AskAI {
  askAI(
    question: "Explain Vue.js reactivity"
    technology: "vue"
    provider: "groq"
    modelName: "llama-3.3-70b-versatile"
  ) {
    answer
    sources { content source }
  }
}
```

## Configuration

### Environment Variables

```bash
# AI Providers (Free options marked with *)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GROQ_API_KEY=your_groq_api_key_here # * FREE
GOOGLE_API_KEY=your_google_api_key_here # * FREE

# Default AI Configuration (use groq or google for free models)
DEFAULT_AI_PROVIDER=groq
AI_TEMPERATURE=0.2
AI_MAX_TOKENS=2000
AI_VISION_TEMPERATURE=0.2
AI_VISION_MAX_TOKENS=1000
```

## Model Characteristics

### 🆓 FREE Models

#### Groq Models (Completely Free)
| Model | Context | Strengths | Cost | Rate Limit |
|-------|---------|-----------|------|------------|
| **🆓 GROQ MODELS** | | | | |
| llama-3.3-70b-versatile | 32K | Reasoning, Code | FREE | 30 req/min |
| llama-3.1-8b-instant | 32K | Speed, Efficiency | FREE | 30 req/min |
| llama-3.2-11b-vision-preview | 8K | Vision, Fast | FREE | 30 req/min |
| mixtral-8x7b-32768 | 32K | Reasoning, Multilingual | FREE | 30 req/min |
| gemma2-9b-it | 8K | General Purpose | FREE | 30 req/min |
| **🆓 GOOGLE MODELS** | | | | |
| gemini-1.5-flash | 1M | Speed, Multimodal | FREE | 15 req/min |
| gemini-1.5-pro | 2M | Advanced, Huge Context | Paid | Usage-based |
| gemini-1.0-pro | 32K | General Purpose | FREE | 60 req/min |

### 💳 Paid Models

#### OpenAI Models
| Model | Context | Strengths | Cost (per 1K tokens) | Vision |
|-------|---------|-----------|---------------------|--------|
| gpt-4-turbo | 128K | Reasoning, Code, Math | $0.01/$0.03 | ✅ |
| gpt-4o | 128K | Vision, Multimodal, Fast | $0.005/$0.015 | ✅ |
| gpt-4o-mini | 128K | Fast, Affordable, Vision | $0.00015/$0.0006 | ✅ |

#### Anthropic Models
| Model | Context | Strengths | Cost (per 1K tokens) | Vision |
|-------|---------|-----------|---------------------|--------|
| claude-3-5-sonnet-20241022 | 200K | Writing, Analysis, Code | $0.003/$0.015 | ✅ |
| claude-3-5-haiku-20241022 | 200K | Speed, Efficiency | $0.0008/$0.004 | ❌ |

## Usage Recommendations

### 🆓 For FREE Users

1. **Best Overall Free Model**: `llama-3.3-70b-versatile` (Groq)
   - Excellent reasoning and code capabilities
   - Completely free with no hidden costs
   - 30 requests per minute

2. **Fastest Free Model**: `llama-3.1-8b-instant` (Groq)
   - Very fast responses
   - Great for real-time applications

3. **Free Vision Model**: `gemini-1.5-flash` (Google)
   - Excellent multimodal capabilities
   - Huge 1M token context window

4. **Large Context**: `gemini-1.5-flash` (Google)
   - 1 million token context window
   - Perfect for analyzing large documents

### For Different Tasks

1. **Complex Reasoning & Analysis**
   - **Free**: Llama 3.1 70B (Groq)
   - **Paid**: Claude 3.5 Sonnet

2. **Vision & Image Analysis**
   - **Free**: Gemini 1.5 Flash (Google)
   - **Paid**: GPT-4o

3. **Speed & Real-time**
   - **Free**: Llama 3.1 8B Instant (Groq)
   - **Paid**: GPT-4o Mini

## 🆓 FREE Models Demo Examples

### Text Generation with Groq
```graphql
query FreeTextGeneration {
  askAI(
    question: "Write a Vue.js component for a todo list"
    technology: "vue"
    provider: "groq"
    modelName: "llama-3.3-70b-versatile"
  ) {
    answer
  }
}
```

### Vision Analysis with Google Gemini
```graphql
mutation FreeVisionAnalysis {
  analyzeImage(
    imageUrl: "/path/to/screenshot.jpg"
    question: "What UI improvements can be made?"
    provider: "google"
    modelName: "gemini-1.5-flash"
  ) {
    answer
    imageDescription
  }
}
```

### Get Available Free Models
```graphql
query GetFreeModels {
  getAvailableProviders {
    provider
    freeModels
    isConfigured
    setupInstructions
  }
}
```

## New GraphQL Queries for FREE Models

### Get Free Providers
```graphql
query GetFreeProviders {
  getFreeProviders
}
```

### Get Setup Instructions
```graphql
query GetSetupInstructions {
  getProviderSetupInstructions(provider: "groq")
}
```

### Check if Model is Free
```graphql
query CheckModelInfo {
  getModelInfo(provider: "groq", modelName: "llama-3.3-70b-versatile") {
    isFree
    rateLimit
    strengths
  }
}
```

## Error Handling

The system includes automatic fallbacks:
- **Prefers free providers** when no specific provider is configured
- Falls back to any available provider if preferred one is not configured
- Clear error messages for missing API keys

## Best Practices for FREE Models

1. **Respect Rate Limits**
   - Groq: 30 requests/minute
   - Google: 15-60 requests/minute depending on model
   - Implement request throttling in production

2. **Choose Right Model for Task**
   - Use Llama 3.1 70B for complex reasoning
   - Use Llama 3.1 8B for simple, fast responses
   - Use Gemini 1.5 Flash for vision tasks

3. **Optimize Context Usage**
   - Free models have generous context windows
   - Take advantage of Gemini's 1M token context

4. **Monitor Usage**
   - Track your requests to stay within rate limits
   - Consider multiple API keys for higher throughput

## Getting Started Now!

1. **Get a FREE Groq API key**: https://console.groq.com/keys
2. **Add to your `.env`**: `GROQ_API_KEY=your_key_here`
3. **Set default provider**: `DEFAULT_AI_PROVIDER=groq`
4. **Start asking questions** with powerful 70B models for FREE!

No credit card, no payment setup - just sign up and start building! 🚀 