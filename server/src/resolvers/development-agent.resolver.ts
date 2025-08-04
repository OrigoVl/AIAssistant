import {
  Query,
  Resolver,
  Arg,
  Mutation,
  ObjectType,
  Field,
  InputType,
} from "type-graphql";
import { AIProvider, AIModelFactory } from "../ai/model-factory";
import { AIConfigService } from "../ai/ai-config.service";
import { CodeSearchService } from "../search/code-search.service";
import { HybridSearchService } from "../search/hybrid-search.service";
import { createQAChain } from "../ai/chain";

@InputType()
export class CodeGenerationInput {
  @Field()
  description: string;

  @Field()
  technology: string;

  @Field({ nullable: true })
  language?: string;

  @Field({ nullable: true })
  framework?: string;

  @Field(() => [String], { nullable: true })
  requirements?: string[];

  @Field({ nullable: true })
  style?: string;

  @Field({ nullable: true })
  includeTests?: boolean;

  @Field({ nullable: true })
  includeDocs?: boolean;
}

@InputType()
export class CodeReviewInput {
  @Field()
  code: string;

  @Field()
  language: string;

  @Field({ nullable: true })
  context?: string;

  @Field(() => [String], { nullable: true })
  focusAreas?: string[];
}

@InputType()
export class DebuggingInput {
  @Field()
  errorMessage: string;

  @Field()
  code: string;

  @Field()
  language: string;

  @Field({ nullable: true })
  stackTrace?: string;

  @Field({ nullable: true })
  environment?: string;
}

@ObjectType()
export class CodeGenerationResult {
  @Field()
  code: string;

  @Field(() => [String], { nullable: true })
  tests?: string[];

  @Field(() => [String], { nullable: true })
  documentation?: string[];

  @Field()
  explanation: string;

  @Field(() => [String])
  suggestions: string[];

  @Field({ nullable: true })
  thinking?: string;

  @Field()
  generatedAt: string;
}

@ObjectType()
export class CodeReviewResult {
  @Field()
  score: number;

  @Field(() => [String])
  issues: string[];

  @Field(() => [String])
  suggestions: string[];

  @Field(() => [String])
  bestPractices: string[];

  @Field()
  summary: string;

  @Field()
  reviewedAt: string;
}

@ObjectType()
export class DebuggingResult {
  @Field()
  rootCause: string;

  @Field(() => [String])
  solutions: string[];

  @Field()
  fixedCode: string;

  @Field(() => [String])
  preventionTips: string[];

  @Field()
  explanation: string;

  @Field()
  debuggedAt: string;
}

@ObjectType()
export class ProjectStructure {
  @Field()
  name: string;

  @Field()
  type: string;

  @Field(() => [String])
  files: string[];

  @Field(() => [String])
  directories: string[];

  @Field()
  description: string;
}

@ObjectType()
export class DevelopmentTask {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  priority: string;

  @Field()
  status: string;

  @Field()
  technology: string;

  @Field()
  estimatedTime: string;

  @Field()
  createdAt: string;
}

@Resolver()
export class DevelopmentAgentResolver {
  private aiConfig = AIConfigService.getInstance();
  private codeSearchService = new CodeSearchService();
  private hybridSearchService = new HybridSearchService();

  @Mutation(() => CodeGenerationResult)
  async generateCode(
    @Arg("input") input: CodeGenerationInput
  ): Promise<CodeGenerationResult> {
    try {
      // Search for relevant examples and patterns
      const searchResults = await this.hybridSearchService.search(
        input.description,
        {
          technology: input.technology,
          limit: 5,
        }
      );

      // Create context from search results
      const context = searchResults
        .map(
          (result: any) =>
            `${result.document?.title || "Example"}: ${
              result.document?.content || "No content"
            }`
        )
        .join("\n\n");

      // Generate code using AI with Chain of Thought reasoning
      const enhancedPrompt = `
You are an expert software developer. Please think through this problem step by step before generating code.

REQUIREMENT:
Generate ${input.language || "code"} for the following requirement:

Description: ${input.description}
Technology: ${input.technology}
Framework: ${input.framework || "standard"}
Requirements: ${input.requirements?.join(", ") || "none specified"}
Style: ${input.style || "clean and readable"}

${context ? `\nRelevant examples:\n${context}` : ""}

THINKING PROCESS:
1. First, analyze the requirement and break it down into components
2. Consider the best practices for ${input.technology}
3. Plan the architecture and structure
4. Think about error handling and edge cases
5. Consider performance and scalability
6. Plan the testing strategy
7. Consider documentation needs

Now, provide a complete response in the following JSON format:
{
  "thinking": "Your step-by-step reasoning process",
  "code": "the actual code here",
  "tests": ["test code if requested"],
  "documentation": ["documentation if requested"],
  "explanation": "detailed explanation of the solution",
  "suggestions": ["suggestion1", "suggestion2"]
}

Make sure the code is production-ready, well-commented, and follows best practices for ${
        input.technology
      }.
`;

      try {
        // Create AI chain for code generation
        const chain = await createQAChain(input.technology.toLowerCase(), {
          temperature: 0.3, // Lower temperature for more focused code generation
          maxTokens: 2000,
        });

        // Call AI to generate code
        const response = await chain.call({ question: enhancedPrompt });

        // Try to parse the response as JSON
        let parsedResponse;
        try {
          // Extract JSON from the response if it's wrapped in markdown
          const jsonMatch = response.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            parsedResponse = JSON.parse(response.text);
          }
        } catch (parseError) {
          // If JSON parsing fails, treat the entire response as code
          parsedResponse = {
            code: response.text,
            tests: input.includeTests
              ? this.generateFallbackTests(input)
              : undefined,
            documentation: input.includeDocs
              ? this.generateFallbackDocs(input)
              : undefined,
            explanation: this.generateFallbackExplanation(input),
            suggestions: this.generateFallbackSuggestions(input),
          };
        }

        return {
          code: parsedResponse.code || response.text,
          tests: input.includeTests
            ? parsedResponse.tests || this.generateFallbackTests(input)
            : undefined,
          documentation: input.includeDocs
            ? parsedResponse.documentation || this.generateFallbackDocs(input)
            : undefined,
          explanation:
            parsedResponse.explanation ||
            this.generateFallbackExplanation(input),
          suggestions:
            parsedResponse.suggestions ||
            this.generateFallbackSuggestions(input),
          thinking: parsedResponse.thinking || this.generateFallbackThinking(input),
          generatedAt: new Date().toISOString(),
        };
      } catch (aiError) {
        console.error("AI code generation failed:", aiError);

        // Fallback to basic code generation
        const fallbackCode = this.generateFallbackCode(input);

        return {
          code: fallbackCode,
          tests: input.includeTests
            ? this.generateFallbackTests(input)
            : undefined,
          documentation: input.includeDocs
            ? this.generateFallbackDocs(input)
            : undefined,
          explanation: this.generateFallbackExplanation(input),
          suggestions: this.generateFallbackSuggestions(input),
          generatedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      throw new Error(
        `Code generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  @Mutation(() => CodeReviewResult)
  async reviewCode(
    @Arg("input") input: CodeReviewInput
  ): Promise<CodeReviewResult> {
    try {
      // Analyze code quality
      const issues: string[] = [];
      const suggestions: string[] = [];
      const bestPractices: string[] = [];

      // Basic code analysis (in a real implementation, use proper static analysis)
      if (input.code.includes("TODO")) {
        issues.push("Contains TODO comments that should be addressed");
      }

      if (input.code.includes("console.log")) {
        suggestions.push(
          "Consider using a proper logging framework instead of console.log"
        );
      }

      if (input.code.length > 1000) {
        suggestions.push(
          "Consider breaking down large functions into smaller, more manageable pieces"
        );
      }

      // Calculate a basic score
      const score = Math.max(
        0,
        100 - issues.length * 10 - suggestions.length * 5
      );

      return {
        score,
        issues,
        suggestions,
        bestPractices: [
          "Follow consistent naming conventions",
          "Add proper error handling",
          "Include comprehensive documentation",
          "Write unit tests for critical functions",
        ],
        summary: `Code review completed with ${issues.length} issues and ${suggestions.length} suggestions`,
        reviewedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Code review failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  @Mutation(() => DebuggingResult)
  async debugCode(
    @Arg("input") input: DebuggingInput
  ): Promise<DebuggingResult> {
    try {
      // Analyze the error and provide debugging assistance
      const rootCause = this.analyzeError(input.errorMessage, input.code);
      const solutions = this.generateSolutions(
        input.errorMessage,
        input.language
      );
      const fixedCode = this.suggestFix(input.code, input.errorMessage);

      return {
        rootCause,
        solutions,
        fixedCode,
        preventionTips: [
          "Add proper error handling",
          "Use TypeScript for better type safety",
          "Implement comprehensive testing",
          "Follow coding standards and best practices",
        ],
        explanation: `Analysis of ${input.errorMessage} in ${input.language} code`,
        debuggedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Debugging failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  @Query(() => [ProjectStructure])
  async getProjectTemplates(
    @Arg("technology") technology: string,
    @Arg("type") type: string
  ): Promise<ProjectStructure[]> {
    const templates = [
      {
        name: "Basic Web App",
        type: "web",
        files: ["index.html", "style.css", "script.js", "package.json"],
        directories: ["src", "public", "tests"],
        description: "A basic web application template",
      },
      {
        name: "API Server",
        type: "api",
        files: ["server.js", "package.json", ".env", "README.md"],
        directories: ["routes", "controllers", "models", "middleware"],
        description: "A RESTful API server template",
      },
      {
        name: "Full Stack App",
        type: "fullstack",
        files: ["package.json", "docker-compose.yml", ".env"],
        directories: ["client", "server", "shared"],
        description: "A full-stack application template",
      },
    ];

    return templates.filter(
      (template) =>
        template.type === type ||
        technology.toLowerCase().includes(template.type)
    );
  }

  @Query(() => [DevelopmentTask])
  async getDevelopmentTasks(
    @Arg("technology", { nullable: true }) technology?: string,
    @Arg("status", { nullable: true }) status?: string
  ): Promise<DevelopmentTask[]> {
    const tasks: DevelopmentTask[] = [
      {
        id: "1",
        title: "Implement User Authentication",
        description: "Add JWT-based authentication system",
        priority: "high",
        status: "pending",
        technology: "node",
        estimatedTime: "4 hours",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Create API Documentation",
        description: "Generate OpenAPI/Swagger documentation",
        priority: "medium",
        status: "in-progress",
        technology: "typescript",
        estimatedTime: "2 hours",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Add Unit Tests",
        description: "Implement comprehensive test suite",
        priority: "high",
        status: "pending",
        technology: "vue",
        estimatedTime: "6 hours",
        createdAt: new Date().toISOString(),
      },
    ];

    return tasks.filter(
      (task) =>
        (!technology || task.technology === technology) &&
        (!status || task.status === status)
    );
  }

  @Query(() => [String])
  async getTechnologyRecommendations(
    @Arg("projectType") projectType: string,
    @Arg("requirements", () => [String]) requirements: string[]
  ): Promise<string[]> {
    const recommendations: { [key: string]: string[] } = {
      web: ["Vue.js", "React", "Angular", "Node.js", "Express"],
      mobile: ["React Native", "Flutter", "Ionic", "NativeScript"],
      desktop: ["Electron", "Tauri", "Flutter Desktop"],
      api: ["Node.js", "Express", "Fastify", "NestJS", "GraphQL"],
      database: ["PostgreSQL", "MongoDB", "Redis", "SQLite"],
      testing: ["Jest", "Vitest", "Cypress", "Playwright"],
    };

    return recommendations[projectType] || ["Node.js", "TypeScript", "Vue.js"];
  }

  private analyzeError(errorMessage: string, code: string): string {
    // Basic error analysis logic
    if (errorMessage.includes("undefined")) {
      return "Variable or property is undefined - check initialization and scope";
    }
    if (errorMessage.includes("null")) {
      return "Null reference error - add null checks";
    }
    if (errorMessage.includes("syntax")) {
      return "Syntax error - check for missing brackets, semicolons, or typos";
    }
    return "General runtime error - review code logic and data flow";
  }

  private generateSolutions(errorMessage: string, language: string): string[] {
    const solutions: string[] = [];

    if (errorMessage.includes("undefined")) {
      solutions.push("Add proper variable initialization");
      solutions.push("Use optional chaining (?.)");
      solutions.push("Add default values");
    }

    if (errorMessage.includes("null")) {
      solutions.push("Add null checks before accessing properties");
      solutions.push("Use nullish coalescing operator (??)");
      solutions.push("Implement proper error handling");
    }

    return solutions.length > 0
      ? solutions
      : [
          "Review the code logic",
          "Check input data",
          "Add proper error handling",
        ];
  }

  private suggestFix(code: string, errorMessage: string): string {
    // Basic fix suggestions
    if (errorMessage.includes("undefined")) {
      return code.replace(/(\w+)\.(\w+)/g, "$1?.$2");
    }
    return code;
  }

  private generateFallbackCode(input: CodeGenerationInput): string {
    // Generate basic fallback code based on technology
    const tech = input.technology.toLowerCase();
    const description = input.description.toLowerCase();

    if (tech === "vue" || tech === "vue.js") {
      return `<template>
  <div class="app">
    <h1>Generated Vue Component</h1>
    <p>Description: ${input.description}</p>
    <!-- TODO: Implement the actual functionality -->
  </div>
</template>

<script setup lang="ts">
// Generated for: ${input.description}
// Technology: ${input.technology}

// TODO: Add your component logic here
</script>

<style scoped>
.app {
  padding: 20px;
}
</style>`;
    } else if (tech === "react") {
      return `import React from 'react';

// Generated for: ${input.description}
// Technology: ${input.technology}

const GeneratedComponent: React.FC = () => {
  // TODO: Implement the actual functionality
  
  return (
    <div className="app">
      <h1>Generated React Component</h1>
      <p>Description: ${input.description}</p>
      {/* TODO: Add your component content */}
    </div>
  );
};

export default GeneratedComponent;`;
    } else if (tech === "node" || tech === "node.js") {
      return `// Generated for: ${input.description}
// Technology: ${input.technology}

const express = require('express');
const app = express();

// TODO: Implement the actual functionality
app.get('/', (req, res) => {
  res.json({ message: 'Generated Node.js API', description: '${input.description}' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
    } else if (tech === "typescript") {
      return `// Generated for: ${input.description}
// Technology: ${input.technology}

interface GeneratedInterface {
  // TODO: Define your interface properties
}

class GeneratedClass {
  // TODO: Implement your class methods
  
  constructor() {
    // TODO: Add constructor logic
  }
  
  public process(): void {
    // TODO: Implement the main functionality
    console.log('Generated TypeScript code for: ${input.description}');
  }
}

export { GeneratedClass, GeneratedInterface };`;
    } else {
      return `// Generated for: ${input.description}
// Technology: ${input.technology}

// TODO: Implement the actual functionality
console.log('Generated code for: ${input.description}');

// Add your implementation here
function main() {
  // TODO: Add your main logic
}

main();`;
    }
  }

  private generateFallbackTests(input: CodeGenerationInput): string[] {
    const tech = input.technology.toLowerCase();
    const description = input.description.toLowerCase();

    if (tech === "vue" || tech === "vue.js") {
      return [
        `import { mount } from '@vue/test-utils'`,
        `import GeneratedComponent from './GeneratedComponent.vue'`,
        ``,
        `describe('GeneratedComponent', () => {`,
        `  it('should render correctly', () => {`,
        `    const wrapper = mount(GeneratedComponent)`,
        `    expect(wrapper.find('.app').exists()).toBe(true)`,
        `    expect(wrapper.text()).toContain('Generated Vue Component')`,
        `  })`,
        `})`,
      ];
    } else if (tech === "react") {
      return [
        `import { render, screen } from '@testing-library/react'`,
        `import GeneratedComponent from './GeneratedComponent'`,
        ``,
        `describe('GeneratedComponent', () => {`,
        `  it('should render correctly', () => {`,
        `    render(<GeneratedComponent />)`,
        `    expect(screen.getByText('Generated React Component')).toBeInTheDocument()`,
        `  })`,
        `})`,
      ];
    } else if (tech === "node" || tech === "node.js") {
      return [
        `const request = require('supertest')`,
        `const app = require('./app')`,
        ``,
        `describe('API Tests', () => {`,
        `  it('should return correct response', async () => {`,
        `    const response = await request(app).get('/')`,
        `    expect(response.status).toBe(200)`,
        `    expect(response.body.message).toBe('Generated Node.js API')`,
        `  })`,
        `})`,
      ];
    } else if (tech === "typescript") {
      return [
        `import { GeneratedClass } from './GeneratedClass'`,
        ``,
        `describe('GeneratedClass', () => {`,
        `  it('should process correctly', () => {`,
        `    const instance = new GeneratedClass()`,
        `    expect(instance).toBeInstanceOf(GeneratedClass)`,
        `  })`,
        `})`,
      ];
    } else {
      return [
        `describe('Generated Code', () => {`,
        `  it('should work correctly', () => {`,
        `    // Add your test logic here`,
        `    expect(true).toBe(true)`,
        `  })`,
        `})`,
      ];
    }
  }

  private generateFallbackDocs(input: CodeGenerationInput): string[] {
    const tech = input.technology.toLowerCase();
    const description = input.description.toLowerCase();

    if (tech === "vue" || tech === "vue.js") {
      return [
        `# Generated Vue Component

## Overview
This component was generated for: ${input.description}

## Usage
\`\`\`vue
<template>
  <GeneratedComponent />
</template>
\`\`\`

## Props
No props currently defined.

## Events
No events currently defined.

## Styling
The component uses scoped styles with the \`.app\` class.`,
      ];
    } else if (tech === "react") {
      return [
        `# Generated React Component

## Overview
This component was generated for: ${input.description}

## Usage
\`\`\`jsx
import GeneratedComponent from './GeneratedComponent'

function App() {
  return <GeneratedComponent />
}
\`\`\`

## Props
No props currently defined.

## Installation
\`\`\`bash
npm install
\`\`\``,
      ];
    } else if (tech === "node" || tech === "node.js") {
      return [
        `# Generated Node.js API

## Overview
This API was generated for: ${input.description}

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`bash
npm start
\`\`\`

## API Endpoints
- \`GET /\`: Returns basic information

## Environment Variables
- \`PORT\`: Server port (default: 3000)`,
      ];
    } else if (tech === "typescript") {
      return [
        `# Generated TypeScript Code

## Overview
This code was generated for: ${input.description}

## Installation
\`\`\`bash
npm install typescript
\`\`\`

## Usage
\`\`\`typescript
import { GeneratedClass } from './GeneratedClass'

const instance = new GeneratedClass()
instance.process()
\`\`\`

## Classes
- \`GeneratedClass\`: Main class with process method
- \`GeneratedInterface\`: Interface for type definitions`,
      ];
    } else {
      return [
        `# Generated Code

## Overview
This code was generated for: ${input.description}

## Usage
\`\`\`bash
node main.js
\`\`\`

## Functions
- \`main()\`: Main entry point

## Customization
Modify the \`main()\` function to implement your specific logic.`,
      ];
    }
  }

  private generateFallbackExplanation(input: CodeGenerationInput): string {
    const tech = input.technology.toLowerCase();
    const description = input.description.toLowerCase();

    if (tech === "vue" || tech === "vue.js") {
      return `This Vue.js component was generated to address your requirement: "${input.description}". 

The component follows Vue 3 Composition API patterns with TypeScript support. It includes:
- A template section with basic HTML structure
- A script setup section for component logic
- Scoped CSS styling for component-specific styles

The component is designed to be easily customizable and follows Vue.js best practices. You can extend it by adding props, events, and additional functionality as needed.`;
    } else if (tech === "react") {
      return `This React component was generated to address your requirement: "${input.description}". 

The component uses modern React patterns with TypeScript and functional components. It includes:
- A functional component with proper TypeScript typing
- JSX structure for rendering
- Export statement for component usage

The component follows React best practices and can be easily integrated into your existing React application. You can enhance it by adding props, state management, and additional features.`;
    } else if (tech === "node" || tech === "node.js") {
      return `This Node.js API was generated to address your requirement: "${input.description}". 

The API uses Express.js framework and includes:
- Basic Express server setup
- A GET endpoint that returns JSON response
- Environment variable configuration for port
- Proper server startup with logging

The API follows Node.js best practices and can be extended with additional endpoints, middleware, and database integration as needed.`;
    } else if (tech === "typescript") {
      return `This TypeScript code was generated to address your requirement: "${input.description}". 

The code includes:
- TypeScript interfaces for type safety
- A class with proper TypeScript typing
- Constructor and method implementations
- Export statements for module usage

The code follows TypeScript best practices with proper type definitions and can be easily extended with additional functionality.`;
    } else {
      return `This code was generated to address your requirement: "${input.description}". 

The implementation includes:
- A main function as the entry point
- Basic console logging for demonstration
- Proper code structure and organization

The code follows general programming best practices and can be customized to meet your specific needs. You can modify the main function to implement the actual functionality you require.`;
    }
  }

  private generateFallbackSuggestions(input: CodeGenerationInput): string[] {
    const tech = input.technology.toLowerCase();
    const suggestions = [
      "Review and test the generated code thoroughly",
      "Add proper error handling and validation",
      "Follow naming conventions and coding standards",
      "Add comprehensive documentation and comments",
      "Consider adding unit tests for critical functionality",
    ];

    if (tech === "vue" || tech === "vue.js") {
      suggestions.push(
        "Add props for component reusability",
        "Implement proper event handling",
        "Consider using Vuex or Pinia for state management",
        "Add accessibility attributes (aria-labels, etc.)",
        "Optimize component performance with v-memo if needed"
      );
    } else if (tech === "react") {
      suggestions.push(
        "Add props for component reusability",
        "Implement proper state management with useState or Redux",
        "Add error boundaries for better error handling",
        "Consider using React.memo for performance optimization",
        "Add proper TypeScript interfaces for props"
      );
    } else if (tech === "node" || tech === "node.js") {
      suggestions.push(
        "Add input validation using libraries like Joi or Yup",
        "Implement proper error handling middleware",
        "Add authentication and authorization",
        "Consider using a database for data persistence",
        "Add API documentation using Swagger/OpenAPI"
      );
    } else if (tech === "typescript") {
      suggestions.push(
        "Add comprehensive type definitions",
        "Implement proper error handling with custom error types",
        "Consider using decorators for additional functionality",
        "Add unit tests with Jest or Vitest",
        "Use strict TypeScript configuration"
      );
    }

    return suggestions;
  }

  private generateFallbackThinking(input: CodeGenerationInput): string {
    const tech = input.technology.toLowerCase();
    const description = input.description.toLowerCase();
    
    return `THINKING PROCESS for "${input.description}" using ${input.technology}:

1. REQUIREMENT ANALYSIS:
   - Understanding: ${input.description}
   - Technology: ${input.technology}
   - Framework: ${input.framework || "standard"}
   - Style: ${input.style || "clean and readable"}

2. ARCHITECTURE PLANNING:
   - Breaking down the requirement into logical components
   - Identifying the main functionality needed
   - Planning the code structure and organization

3. TECHNOLOGY CONSIDERATIONS:
   - Following ${input.technology} best practices
   - Using appropriate patterns and conventions
   - Ensuring code maintainability and readability

4. ERROR HANDLING STRATEGY:
   - Identifying potential failure points
   - Planning appropriate error handling mechanisms
   - Considering edge cases and validation

5. PERFORMANCE CONSIDERATIONS:
   - Optimizing for efficiency where applicable
   - Following performance best practices for ${input.technology}
   - Ensuring scalable design

6. TESTING APPROACH:
   - Planning unit tests for critical functionality
   - Considering integration testing needs
   - Ensuring code coverage for important features

7. DOCUMENTATION STRATEGY:
   - Providing clear code comments
   - Creating comprehensive documentation
   - Including usage examples and explanations

This systematic approach ensures the generated code is robust, maintainable, and follows industry best practices.`;
  }
}
