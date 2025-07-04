# 🆓 FREE AI Models Setup Guide

## 🎯 Available FREE Models

### 1. **Groq** (Completely Free)
- **llama-3.3-70b-versatile** - Best overall free model
- **llama-3.1-8b-instant** - Fastest free model
- **llama-3.2-11b-vision-preview** - Free vision model
- **mixtral-8x7b-32768** - Multilingual support
- **gemma2-9b-it** - General purpose

### 2. **Google Gemini** (Free Tier)
- **gemini-1.5-flash** - 15 requests/minute
- **gemini-1.0-pro** - 60 requests/minute

## 🚀 Quick Setup

### Step 1: Create accounts & get API keys
1. **Groq**: [console.groq.com](https://console.groq.com) (no credit card required)
2. **Google**: [aistudio.google.com](https://aistudio.google.com) (no credit card required)

### Step 2: Add to your .env file
```bash
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

## 🧪 Testing Free Models

### Test Groq Model
```bash
npm run demo-ai
```

### Test with specific model
```graphql
query TestGroqModel {
  askAI(
    question: "Explain Vue.js reactive system"
    technology: "vue"
    provider: "groq"
    modelName: "llama-3.3-70b-versatile"
  ) {
    answer
    sources {
      source
    }
  }
}
```

## 🔧 Configuration

### Set default to free model
```bash
# In your .env file
DEFAULT_AI_PROVIDER=groq
```

### Use programmatically
```typescript
import { AIModelFactory, AIProvider } from './src/ai/model-factory';

const freeModel = AIModelFactory.createChatModel({
  provider: AIProvider.GROQ,
  modelName: "llama-3.3-70b-versatile",
  temperature: 0.2,
});
```

## 🏆 Best Free Model Recommendations

1. **For Reasoning**: `llama-3.3-70b-versatile` (Groq)
2. **For Speed**: `llama-3.1-8b-instant` (Groq)
3. **For Vision**: `llama-3.2-11b-vision-preview` (Groq)
4. **For Large Context**: `gemini-1.5-flash` (Google)

## 📊 Rate Limits

| Provider | Model | Requests/min | Context Window |
|----------|-------|--------------|----------------|
| Groq | llama-3.3-70b-versatile | 30 | 32K |
| Groq | llama-3.1-8b-instant | 30 | 32K |
| Groq | llama-3.2-11b-vision-preview | 30 | 8K |
| Google | gemini-1.5-flash | 15 | 1M |
| Google | gemini-1.0-pro | 60 | 32K |

## 💡 Pro Tips

1. **Start with Groq**: No credit card required, excellent performance
2. **Use for development**: Perfect for testing and prototyping
3. **Monitor usage**: Check rate limits in console logs
4. **Combine providers**: Use different models for different tasks

## 🚨 Important Notes

- All listed models are **completely free** (Groq) or have **generous free tiers** (Google)
- No hidden costs or surprise bills
- Rate limits are per provider, not per model
- Perfect for development, testing, and small-scale production

## 🎉 Get Started

1. Copy API keys to `.env`
2. Run `npm run demo-ai` to test
3. Start building with free AI models!

**💡 You can build a full AI application without spending a single dollar!** 