import { Injectable, signal } from '@angular/core';
import type { StoredEmbedding } from './idb';

export interface StoredEmbeddingWithScore {
  candidate: StoredEmbedding;
  score: number;
}

export type ProgressCallback = (loaded: number, total: number) => void;

interface ModelProgressEvent {
  status?: string;
  loaded?: number;
  total?: number;
}

interface FeatureExtractor {
  (
    text: string,
    opts: { pooling: string; normalize: boolean },
  ): Promise<{ data: ArrayLike<number> }>;
}

@Injectable({ providedIn: 'root' })
export class EmbeddingService {
  private pipeline: FeatureExtractor | null = null;
  private loadingPromise: Promise<void> | null = null;

  readonly modelStatus = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly modelProgress = signal<{ loaded: number; total: number } | null>(null);

  async ensureModel(onProgress?: ProgressCallback): Promise<void> {
    if (this.pipeline) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.modelStatus.set('loading');
    this.loadingPromise = (async () => {
      try {
        const mod = await import('@xenova/transformers');
        const transformers = mod as unknown as {
          pipeline: (
            task: string,
            model: string,
            opts: { quantized: boolean; progress_callback: (p: ModelProgressEvent) => void },
          ) => Promise<FeatureExtractor>;
          env: { useFS: boolean; allowLocalModels: boolean };
        };
        transformers.env.useFS = false;
        transformers.env.allowLocalModels = false;

        this.pipeline = await transformers.pipeline(
          'feature-extraction',
          'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
          {
            quantized: true,
            progress_callback: (p: ModelProgressEvent) => {
              if (p.status === 'progress' && p.total) {
                const loaded = p.loaded ?? 0;
                const total = p.total ?? 0;
                this.modelProgress.set({ loaded, total });
                onProgress?.(loaded, total);
              }
            },
          },
        );
        this.modelStatus.set('ready');
      } catch (err) {
        this.modelStatus.set('error');
        throw err;
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }

  async encode(text: string): Promise<Float32Array> {
    if (!this.pipeline) {
      throw new Error('Model not loaded. Call ensureModel() first.');
    }
    const result = await this.pipeline(text, { pooling: 'mean', normalize: true });
    return new Float32Array(result.data);
  }

  cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
    }
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  cosineTopK(
    query: Float32Array,
    candidates: StoredEmbedding[],
    k: number,
  ): StoredEmbeddingWithScore[] {
    const scored: StoredEmbeddingWithScore[] = candidates.map((candidate) => ({
      candidate,
      score: this.cosineSimilarity(query, new Float32Array(candidate.vector)),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }
}
