# AI Assistant Server

A GraphQL server built with NestJS-style architecture using Apollo Server, TypeGraphQL, and TypeORM.

## ✅ Current Status

The server is **fully functional** and can run with or without database connectivity:
- ✅ GraphQL API running at `http://localhost:4000/graphql`
- ✅ Health check endpoint at `http://localhost:4000/health`
- ✅ All TypeScript compilation issues resolved
- ✅ Graceful database error handling
- ⚠️ Database setup required for document search functionality

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 12+ (optional - server runs without it)

### Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. **Start the server** (works without database):
```bash
npm run start
# or for development
npm run dev
```

The server will start at `http://localhost:4000/graphql` even without database!

### Optional: Database Setup

To enable document search functionality, set up PostgreSQL:

1. **Install PostgreSQL** (if not installed):
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

2. **Create database and user**:
```sql
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE ai_assistant;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE ai_assistant TO postgres;
\q
```

3. **Restart the server** - it will automatically connect to the database.

### Environment Variables

You can customize database connection by setting these environment variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ai_assistant
```

## GraphQL Schema

### Working Queries (no database required):
- `healthCheck`: Server and database status
- `getGitHubIssue(issueId: String!)`: Mock GitHub issue data

### Database-dependent Queries:
- `searchDocuments(query: String!)`: Search documents (returns empty if no DB)

### Example Queries

```graphql
# Health check
{
  healthCheck
}

# GitHub issue
{
  getGitHubIssue(issueId: "123") {
    id
    title
    state
    url
  }
}

# Document search (requires database)
{
  searchDocuments(query: "example") {
    id
    title
    content
  }
}
```

## Testing

You can test the API using:

**GraphQL Playground**: Visit `http://localhost:4000/graphql`

**cURL**:
```bash
# Health check
curl http://localhost:4000/health

# GraphQL query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ healthCheck }"}'
```

## Project Structure

```
src/
├── entities/          # TypeORM entities
├── resolvers/         # GraphQL resolvers
├── types/            # GraphQL types
├── db/               # Database configuration
└── index.ts          # Server entry point
``` 