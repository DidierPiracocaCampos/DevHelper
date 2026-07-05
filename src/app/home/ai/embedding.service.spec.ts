import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EmbeddingService } from './embedding.service';
import type { StoredEmbedding } from './idb';

describe('EmbeddingService — pure helpers', () => {
  let service: EmbeddingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [EmbeddingService] });
    service = TestBed.inject(EmbeddingService);
  });

  describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      expect(service.cosineSimilarity(a, a)).toBeCloseTo(1, 5);
    });

    it('returns 0 for orthogonal vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([0, 1, 0]);
      expect(service.cosineSimilarity(a, b)).toBeCloseTo(0, 5);
    });

    it('returns -1 for opposite vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([-1, 0, 0]);
      expect(service.cosineSimilarity(a, b)).toBeCloseTo(-1, 5);
    });

    it('throws if vectors have different lengths', () => {
      const a = new Float32Array([1, 0]);
      const b = new Float32Array([1, 0, 0]);
      expect(() => service.cosineSimilarity(a, b)).toThrow();
    });
  });

  describe('cosineTopK', () => {
    const make = (id: string, vec: number[]): StoredEmbedding => ({
      uid: 'u',
      collection: 'issues',
      docId: id,
      text: '',
      vector: vec,
      modelVersion: 'v',
      updatedAt: 0,
    });

    it('returns top k by score', () => {
      const query = new Float32Array([1, 0, 0]);
      const candidates = [make('a', [0.9, 0.1, 0]), make('b', [1, 0, 0]), make('c', [0, 1, 0])];
      const top = service.cosineTopK(query, candidates, 2);
      expect(top.length).toBe(2);
      expect(top[0].candidate.docId).toBe('b');
      expect(top[1].candidate.docId).toBe('a');
      expect(top[0].score).toBeGreaterThan(top[1].score);
    });

    it('returns all candidates when k > length', () => {
      const query = new Float32Array([1, 0, 0]);
      const candidates = [make('a', [1, 0, 0])];
      const top = service.cosineTopK(query, candidates, 5);
      expect(top.length).toBe(1);
    });

    it('returns empty for empty candidates', () => {
      const query = new Float32Array([1, 0, 0]);
      const top = service.cosineTopK(query, [], 5);
      expect(top.length).toBe(0);
    });
  });
});
