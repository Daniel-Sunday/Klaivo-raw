import { describe, it, expect } from 'vitest';
import { cosineSimilarity, getEmbedding } from '../utils/memoryEngine';

describe('Memory Engine & Vector Similarity Suite', () => {
  it('should compute exact cosine similarity for identical vectors', () => {
    const vecA = [0.5, 0.5, 0.5, 0.5];
    const score = cosineSimilarity(vecA, vecA);
    expect(score).toBeCloseTo(1.0);
  });

  it('should return 0 similarity for orthogonal vectors', () => {
    const vecA = [1, 0];
    const vecB = [0, 1];
    const score = cosineSimilarity(vecA, vecB);
    expect(score).toBe(0);
  });

  it('should generate valid normalized vector embedding fallback', async () => {
    const embedding = await getEmbedding('Typescript Generics and Type Inference');
    expect(embedding).toBeDefined();
    expect(embedding.length).toBeGreaterThan(0);
  });
});
