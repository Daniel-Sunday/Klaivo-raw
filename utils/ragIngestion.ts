import * as db from '../database';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface ArtifactChunk {
  chunkIndex: number;
  text: string;
}

export interface SyllabusMetadata {
  subjectTitle: string;
  importantTopics: string[];
  markingCriteria: string[];
  keyTerms: string[];
  summary: string;
}

export async function processUploadedArtifact(
  sessionId: string,
  filename: string,
  rawText: string
): Promise<{ artifactId: string; chunksCount: number; metadata: SyllabusMetadata }> {
  const artifactId = `art_${Date.now()}_${Math.round(Math.random() * 1e5)}`;

  // 1. Chunk document text into ~500 token windows
  const chunks: string[] = [];
  const lines = rawText.split('\n');
  let currentChunk = '';

  for (const line of lines) {
    if ((currentChunk + '\n' + line).length > 1500) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  // 2. Extract structured syllabus metadata using LLM
  let metadata: SyllabusMetadata = {
    subjectTitle: filename.replace(/\.[^/.]+$/, ''),
    importantTopics: [],
    markingCriteria: [],
    keyTerms: [],
    summary: rawText.slice(0, 300),
  };

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `Extract structured syllabus and assessment metadata from this uploaded document:
Filename: "${filename}"
Document Snippet:
"${rawText.slice(0, 3000)}"

Output valid JSON matching this structure:
{
  "subjectTitle": "string",
  "importantTopics": ["topic1", "topic2"],
  "markingCriteria": ["criterion1", "criterion2"],
  "keyTerms": ["term1", "term2"],
  "summary": "string"
}`;
    const result = await model.generateContent(prompt);
    const textOut = result.response.text();
    const jsonMatch = textOut.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      metadata = {
        subjectTitle: parsed.subjectTitle || metadata.subjectTitle,
        importantTopics: parsed.importantTopics || [],
        markingCriteria: parsed.markingCriteria || [],
        keyTerms: parsed.keyTerms || [],
        summary: parsed.summary || metadata.summary,
      };
    }
  } catch (err: any) {
    console.warn('[RAG] Fallback to default metadata extraction:', err.message);
  }

  // 3. Save artifact & chunks to DB
  await db.saveSessionArtifact(sessionId, artifactId, filename, rawText, metadata);

  for (let i = 0; i < chunks.length; i++) {
    await db.saveVectorEmbedding(sessionId, artifactId, i, chunks[i], []);
  }

  return {
    artifactId,
    chunksCount: chunks.length,
    metadata,
  };
}

export async function searchSessionArtifacts(
  sessionId: string,
  query: string,
  topK: number = 3
): Promise<string[]> {
  const chunks = await db.getVectorEmbeddings(sessionId);
  if (!chunks || chunks.length === 0) return [];

  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\W+/).filter((w) => w.length > 2);

  // Score chunks by keyword relevance / overlap
  const scored = chunks.map((c) => {
    const lowerText = c.chunk_text.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (lowerText.includes(word)) score += 1;
    }
    return { chunk: c.chunk_text, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.chunk);
}
