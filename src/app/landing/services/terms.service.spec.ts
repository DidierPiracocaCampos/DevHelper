import { TestBed } from '@angular/core/testing';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { TermsService } from './terms.service';

describe('TermsService', () => {
  let service: TermsService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TermsService);
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('load() returns content on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Términos'),
    } as Response);

    const result = await service.load();

    expect(result).toBe('# Términos');
    expect(fetchMock).toHaveBeenCalledWith('/legal/terms-es.md');
  });

  it('load() returns fallback on error', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    const result = await service.load();

    expect(result).toBe('(no se pudo cargar el documento, intente más tarde)');
  });

  it('load() returns fallback and does not populate cache on error', async () => {
    fetchMock.mockRejectedValue(new Error('boom'));

    await service.load();

    expect(service.content()).toBeNull();
  });

  it('content computed signal returns cached value after load', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('hello world'),
    } as Response);

    expect(service.content()).toBeNull();

    await service.load();

    expect(service.content()).toBe('hello world');
  });

  it('content computed signal stays null when load fails', async () => {
    fetchMock.mockRejectedValue(new Error('boom'));

    await service.load();

    expect(service.content()).toBeNull();
  });
});
