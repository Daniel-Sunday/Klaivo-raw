import { GoogleGenerativeAI } from '@google/generative-ai';
import * as db from '../database';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface MemoryVectorEntry {
  id: string;
  learnerId: string;
  content: string;
  similarityScore?: number;
  metadata?: Record<string, any>;
}

// Compute Cosine Similarity between two numerical vector arrays
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate simple hash/fallback embedding if offline/API fails
function generateFallbackEmbedding(text: string, dimensions = 64): number[] {
  const vec = new Array(dimensions).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    vec[i % dimensions] += charCode / 255;
  }
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((v) => v / norm);
}

/**
 * Generate embedding vector using Gemini text-embedding-004 model with zero-fail fallback
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) return generateFallbackEmbedding('empty');

  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    if (result?.embedding?.values) {
      return result.embedding.values;
    }
  } catch (err) {
    console.warn('[MemoryEngine] Gemini embedding API call failed — utilizing vector fallback');
  }

  return generateFallbackEmbedding(text);
}

/**
 * Store a learner misconception into long-term vector memory
 */
export async function storeLearnerMemory(
  learnerId: string,
  content: string,
  entityType = 'misconception',
  metadata: Record<string, any> = {}
): Promise<string> {
  const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const embedding = await getEmbedding(content);

  const sqlite = (db as any).sqliteDb || (db as any).getSqliteDb?.();
  if (sqlite) {
    sqlite.prepare(`
      INSERT INTO vector_embeddings (id, entity_type, entity_id, embedding_json, content, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      entityType,
      learnerId,
      JSON.stringify(embedding),
      content,
      JSON.stringify(metadata)
    );
  }

  return id;
}

/**
 * Retrieve top N relevant memories/misconceptions for a learner matching a target query
 */
export async function retrieveRelevantMemories(
  learnerId: string,
  queryText: string,
  topK = 5
): Promise<MemoryVectorEntry[]> {
  const queryVec = await getEmbedding(queryText);
  const sqlite = (db as any).sqliteDb || (db as any).getSqliteDb?.();

  if (!sqlite) return [];

  const rows = sqlite.prepare(`
    SELECT id, entity_id, embedding_json, content, metadata_json
    FROM vector_embeddings
    WHERE entity_id = ?
  `).all(learnerId);

  const scored: MemoryVectorEntry[] = [];

  for (const row of rows) {
    let vec: number[] = [];
    try {
      vec = JSON.parse(row.embedding_json);
    } catch (_) {}

    const score = cosineSimilarity(queryVec, vec);
    let metadata = {};
    try {
      metadata = JSON.parse(row.metadata_json || '{}');
    } catch (_) {}

    scored.push({
      id: row.id,
      learnerId: row.entity_id,
      content: row.content,
      similarityScore: score,
      metadata,
    });
  }

  return scored
    .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
    .slice(0, topK);
}
