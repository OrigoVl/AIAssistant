# AI Development Assistant - Fullstack Agent

A comprehensive AI-powered development assistant built with Node.js, Vue.js, and TypeScript. This fullstack application provides intelligent code generation, debugging, project management, and technical guidance for developers.

## 🚀 Features

### AI Assistant

- **Intelligent Q&A**: Get answers to technical questions with context-aware responses
- **Code Analysis**: Analyze code snippets and get explanations
- **Image Analysis**: Upload screenshots and get code-related insights
- **Technology-Specific Guidance**: Tailored responses for Vue.js, Node.js, TypeScript, and more
- **Technical Validation**: Automatic validation of technical queries

### Development Agent

- **Code Generation**: Generate code based on descriptions and requirements
- **Code Review**: Analyze code quality, identify issues, and suggest improvements
- **Debugging Assistant**: Get help with error analysis and solutions
- **Project Management**: Manage development tasks and explore project templates
- **Technology Recommendations**: Get personalized tech stack recommendations

## 🏗️ Architecture

### Backend (Node.js + TypeScript)

- **GraphQL API**: Apollo Server with TypeGraphQL
- **Database**: PostgreSQL with TypeORM
- **AI Integration**: Multiple AI providers (OpenAI, Anthropic, Google, Groq)
- **Vector Search**: ChromaDB for semantic search
- **File Upload**: Multer for image processing
- **Code Search**: Hybrid search strategies

### Frontend (Vue.js + TypeScript)

- **Modern UI**: Clean, responsive design with CSS custom properties
- **State Management**: Pinia for state management
- **GraphQL Client**: Apollo Client for API communication
- **Router**: Vue Router for navigation
- **Composables**: Reusable logic with Vue 3 Composition API

## 📁 Project Structure

```
AIAssistant/
├── client/ai-assistant-client/     # Vue.js frontend
│   ├── src/
│   │   ├── components/            # Vue components
│   │   │   ├── development/       # Development agent panels
│   │   │   └── ...
│   │   ├── composables/           # Reusable logic
│   │   ├── router/                # Vue Router configuration
│   │   ├── stores/                # Pinia stores
│   │   ├── types/                 # TypeScript type definitions
│   │   └── views/                 # Page components
│   └── ...
├── server/                        # Node.js backend
│   ├── src/
│   │   ├── ai/                    # AI integration
│   │   ├── entities/              # Database entities
│   │   ├── resolvers/             # GraphQL resolvers
│   │   ├── search/                # Search strategies
│   │   ├── services/              # Business logic
│   │   └── types/                 # TypeScript types
│   └── ...
└── ...
```

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **API**: GraphQL (Apollo Server + TypeGraphQL)
- **Database**: PostgreSQL + TypeORM
- **AI**: LangChain + Multiple AI providers
- **Search**: ChromaDB + Hybrid search
- **File Processing**: Multer + Sharp

### Frontend

- **Framework**: Vue.js 3
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router 4
- **GraphQL Client**: Apollo Client
- **Styling**: CSS with custom properties
- **Linting**: ESLint + Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AIAssistant
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client/ai-assistant-client
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Backend environment variables
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**

   ```bash
   # Create PostgreSQL database
   createdb ai_assistant

   # Run migrations
   cd server
   npm run migration:run
   ```

5. **Start the application**

   ```bash
   # Start backend (from server directory)
   npm run dev

   # Start frontend (from client/ai-assistant-client directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend GraphQL: http://localhost:4000/graphql
   - Health Check: http://localhost:4000/health

## 🔧 Configuration

### AI Providers

Configure your AI providers in the backend `.env` file:

```env
# OpenAI
OPENAI_API_KEY=your_openai_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Google AI
GOOGLE_AI_API_KEY=your_google_key

# Groq
GROQ_API_KEY=your_groq_key
```

### Database

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ai_assistant
```

## 📚 API Documentation

### GraphQL Endpoints

#### AI Assistant

```graphql
query AskAI($question: String!, $technology: String!) {
  askAI(question: $question, technology: $technology) {
    answer
    sources
    warning
    isTechnical
    suggestions
  }
}
```

#### Development Agent

```graphql
mutation GenerateCode($input: CodeGenerationInput!) {
  generateCode(input: $input) {
    code
    tests
    documentation
    explanation
    suggestions
  }
}

mutation ReviewCode($input: CodeReviewInput!) {
  reviewCode(input: $input) {
    score
    issues
    suggestions
    bestPractices
  }
}

mutation DebugCode($input: DebuggingInput!) {
  debugCode(input: $input) {
    rootCause
    solutions
    fixedCode
    preventionTips
  }
}
```

## 🎯 Usage Examples

### Code Generation

1. Navigate to Development Agent
2. Select "Code Generation" tab
3. Describe what you want to build
4. Select technology and requirements
5. Generate code with tests and documentation

### Code Review

1. Navigate to Development Agent
2. Select "Code Review" tab
3. Paste your code
4. Select language and focus areas
5. Get quality score and suggestions

### AI Q&A

1. Navigate to AI Assistant
2. Select your technology
3. Ask technical questions
4. Get intelligent responses with sources

## 🔍 Development

### Backend Development

```bash
cd server

# Run in development mode
npm run dev

# Run tests
npm test

# Generate migrations
npm run migration:generate

# Run migrations
npm run migration:run
```

### Frontend Development

```bash
cd client/ai-assistant-client

# Run in development mode
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client/ai-assistant-client
npm run test
```

## 📦 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

1. Build the frontend: `npm run build`
2. Set up production environment variables
3. Run database migrations
4. Start the backend server
5. Serve the frontend build files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Apollo GraphQL](https://www.apollographql.com/) - GraphQL platform
- [LangChain](https://langchain.com/) - AI application framework
- [ChromaDB](https://www.trychroma.com/) - Vector database

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the GraphQL schema

---

**Built with ❤️ for developers**
