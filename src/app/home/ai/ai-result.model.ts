import type { AiIntent } from './ai-intent.enum';

export type AiStatus = 'disabled' | 'downloading' | 'ready' | 'error';

export interface AiMatchedDoc {
  id: string;
  collection: 'proyectos' | 'issues' | 'passwords';
  title: string;
  score: number;
}

export interface AiResult {
  intent: AiIntent;
  answer: string;
  matched: AiMatchedDoc[];
}

export class VaultLockedError extends Error {
  constructor() {
    super('Vault is locked. AI assistant is unavailable.');
    this.name = 'VaultLockedError';
  }
}

export class ModelNotReadyError extends Error {
  constructor() {
    super('AI model is not ready. Enable the assistant first.');
    this.name = 'ModelNotReadyError';
  }
}
