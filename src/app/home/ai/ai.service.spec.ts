/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { QueryIntentService } from './query-intent.service';
import { ProjectRepository } from '../service/projects.repository';
import { IssueRepository } from '../service/issues.repository';
import { PasswordRepository } from '../service/passwords.repository';
import { VaultSecurity } from '../../shared/security/vault-security';
import { Authenticator } from '../../shared/service/authenticator';
import { VaultLockedError, ModelNotReadyError } from './ai-result.model';

describe('AiService', () => {
  let service: AiService;
  let mockEmbedding: Partial<EmbeddingService>;
  let mockQueryIntent: Partial<QueryIntentService>;
  let mockVault: Partial<VaultSecurity>;
  let mockAuth: Partial<Authenticator>;
  let mockProjects: Partial<ProjectRepository>;
  let mockIssues: Partial<IssueRepository>;
  let mockPasswords: Partial<PasswordRepository>;

  beforeEach(() => {
    mockEmbedding = {
      ensureModel: vi.fn().mockResolvedValue(undefined),
      encode: vi.fn().mockResolvedValue(new Float32Array(384)),
      cosineTopK: vi.fn().mockReturnValue([]),
    };
    mockQueryIntent = { classify: vi.fn().mockReturnValue({ intent: 'unknown' }) };
    mockVault = { isUnlocked: vi.fn(() => true) as any };
    mockAuth = { user: vi.fn(() => ({ uid: 'u1' }) as any) as any };
    mockProjects = { allDocs: vi.fn(() => []) as any };
    mockIssues = { allDocs: vi.fn(() => []) as any };
    mockPasswords = { allDocs: vi.fn(() => []) as any };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        AiService,
        { provide: EmbeddingService, useValue: mockEmbedding },
        { provide: QueryIntentService, useValue: mockQueryIntent },
        { provide: VaultSecurity, useValue: mockVault },
        { provide: Authenticator, useValue: mockAuth },
        { provide: ProjectRepository, useValue: mockProjects },
        { provide: IssueRepository, useValue: mockIssues },
        { provide: PasswordRepository, useValue: mockPasswords },
      ],
    });
    service = TestBed.inject(AiService);
  });

  it('starts in disabled status', () => {
    expect(service.status()).toBe('disabled');
  });

  it('transitions to ready after enable()', async () => {
    await service.enable();
    expect(service.status()).toBe('ready');
  });

  it('query() rejects with VaultLockedError when vault is locked', async () => {
    (mockVault.isUnlocked as any) = vi.fn(() => false); // isUnlocked is a Signal<boolean>; mock as function
    await service.enable();
    await expect(service.query('hola')).rejects.toBeInstanceOf(VaultLockedError);
  });

  it('query() rejects with ModelNotReadyError when not enabled', async () => {
    await expect(service.query('hola')).rejects.toBeInstanceOf(ModelNotReadyError);
  });

  it('query() with intent list_pending returns pending template result', async () => {
    (mockQueryIntent.classify as any).mockReturnValue({ intent: 'list_pending' });
    (mockIssues.allDocs as any).mockReturnValue([{ title: 'X', status: 'pending' } as any]);
    await service.enable();
    const result = await service.query('qué tareas pendientes');
    expect(result.intent).toBe('list_pending');
    expect(result.answer).toContain('X');
  });

  it('enable() sets status to "loading" when model is already in cache', async () => {
    const fakeCache = {
      keys: vi.fn().mockResolvedValue([
        {
          url: 'https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2/resolve/main/model.safetensors',
        },
      ]),
    };
    const originalCaches = (globalThis as { caches?: unknown }).caches;
    (globalThis as { caches?: unknown }).caches = {
      open: vi.fn().mockResolvedValue(fakeCache),
    };
    const statusSignal = (service as unknown as { status: { set: (v: string) => void } }).status;
    const seenStatuses: string[] = [];
    const originalSet = statusSignal.set.bind(statusSignal);
    statusSignal.set = (v: string) => {
      seenStatuses.push(v);
      originalSet(v);
    };
    try {
      await service.enable();
      expect(service.status()).toBe('ready');
      expect(seenStatuses).toContain('loading');
      expect(seenStatuses).not.toContain('downloading');
    } finally {
      statusSignal.set = originalSet;
      (globalThis as { caches?: unknown }).caches = originalCaches;
    }
  });

  it('enable() sets status to "downloading" when cache is empty', async () => {
    const fakeCache = {
      keys: vi.fn().mockResolvedValue([]),
    };
    const originalCaches = (globalThis as { caches?: unknown }).caches;
    (globalThis as { caches?: unknown }).caches = {
      open: vi.fn().mockResolvedValue(fakeCache),
    };
    const statusSignal = (service as unknown as { status: { set: (v: string) => void } }).status;
    const seenStatuses: string[] = [];
    const originalSet = statusSignal.set.bind(statusSignal);
    statusSignal.set = (v: string) => {
      seenStatuses.push(v);
      originalSet(v);
    };
    try {
      await service.enable();
      expect(service.status()).toBe('ready');
      expect(seenStatuses).toContain('downloading');
    } finally {
      statusSignal.set = originalSet;
      (globalThis as { caches?: unknown }).caches = originalCaches;
    }
  });
});
