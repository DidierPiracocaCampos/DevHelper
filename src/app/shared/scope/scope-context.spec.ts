import { ScopeContext } from './scope-context';

describe('ScopeContext', () => {
  let service: ScopeContext;

  beforeEach(() => {
    service = new ScopeContext();
  });

  it('starts in global scope', () => {
    expect(service.scope()).toBe('global');
    expect(service.isGlobal()).toBe(true);
    expect(service.isIssue()).toBe(false);
  });

  it('setIssue switches scope to issue with projectId and issueId', () => {
    service.setIssue('p1', 'i1');
    expect(service.scope()).toEqual({ kind: 'issue', projectId: 'p1', issueId: 'i1' });
    expect(service.isGlobal()).toBe(false);
    expect(service.isIssue()).toBe(true);
  });

  it('setGlobal switches back to global', () => {
    service.setIssue('p1', 'i1');
    service.setGlobal();
    expect(service.scope()).toBe('global');
    expect(service.isGlobal()).toBe(true);
  });

  it('setIssue overrides the previous issue', () => {
    service.setIssue('p1', 'i1');
    service.setIssue('p2', 'i2');
    expect(service.scope()).toEqual({ kind: 'issue', projectId: 'p2', issueId: 'i2' });
  });
});
