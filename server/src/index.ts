import 'reflect-metadata';
import * as dotenv from 'dotenv';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { AssistantResolver } from './resolvers/assistant.resolver';
import { AIResolver } from './resolvers/ai.resolver';
import { ImageResolver } from './resolvers/image.resolver';
import { SearchResolver } from './resolvers/search.resolver';
import { AppDataSource } from './data-source';
import { SearchResult } from './types/search-result.type';
import { QAAnswer } from './types/qa-answer.type';
import { ImageAnalysis } from './types/image-analysis.type';

// Load environment variables
dotenv.config();

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

async function bootstrap(): Promise<void> {
  let databaseConnected = false;
  
  // Try to initialize database connection
  try {
    await AppDataSource.initialize();
    databaseConnected = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️  Database connection failed. Server will start without database.');
    console.warn('To connect to database, ensure PostgreSQL is running and create:');
    console.warn('  Database: ai_assistant');
    console.warn('  User: postgres (password: postgres)');
    console.warn('Error:', error instanceof Error ? error.message : error);
  }

  const schema = await buildSchema({
    resolvers: [AssistantResolver, AIResolver, ImageResolver, SearchResolver],
    orphanedTypes: [SearchResult, QAAnswer, ImageAnalysis],  
  });

  const server = new ApolloServer({ 
    schema,
    introspection: true, // Enable GraphQL playground in development
  });
  
  await server.start();

  const app = express();
  
  // File upload endpoint
  app.post('/upload-image', cors(), upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      res.json({
        success: true,
        imageUrl: req.file.path,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  // Serve uploaded images
  app.use('/uploads', express.static(uploadsDir));
  
  // Add GraphQL middleware
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req, databaseConnected }),
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      database: databaseConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  });

  const port = process.env.PORT || 4000;
  
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    console.log(`📊 Health check at http://localhost:${port}/health`);
    console.log(`📁 File upload at http://localhost:${port}/upload-image`);
    console.log(`🖼️  Static files at http://localhost:${port}/uploads`);
    if (!databaseConnected) {
      console.log('🔍 Note: Some queries may not work without database connection');
    }
  });
}

bootstrap().catch((error: Error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});