import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document as LangchainDoc } from "@langchain/core/documents";
import { AppDataSource } from "../data-source";
import { Document } from "../entities/document.entity";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function initVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
  });

  const collectionName = "tech-docs-" + (process.env.NODE_ENV || "development");

  // Create from documents if no existing collection
  const vectorStore = new Chroma(embeddings, {
    collectionName,
    url: process.env.CHROMA_URL || "http://localhost:8000",
  });

  return vectorStore;
}

export async function populateVectorStore() {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docRepo = AppDataSource.getRepository(Document);
  const documents = await docRepo.find();

  const langchainDocs: LangchainDoc[] = [];

  for (const doc of documents) {
    const chunks = await splitter.splitText(doc.content);

    for (const [i, chunk] of chunks.entries()) {
      langchainDocs.push(
        new LangchainDoc({
          pageContent: chunk,
          metadata: {
            id: doc.id,
            source: doc.source,
            title: doc.title,
            type: doc.type,
            technology: doc.technology,
            chunkIndex: i,
          },
        })
      );
    }
  }

  if (langchainDocs.length > 0) {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-small",
    });

    const collectionName = "tech-docs-" + (process.env.NODE_ENV || "development");

    // Create vector store from documents
    const vectorStore = await Chroma.fromDocuments(
      langchainDocs,
      embeddings,
      {
        collectionName,
        url: process.env.CHROMA_URL || "http://localhost:8000",
      }
    );

    await vectorStore.addDocuments(langchainDocs);
    return vectorStore;
  } else {
    return null;
  }
}
