import { ScopeContext } from './scope-context';

describe('ScopeContext', () => {
  let service: ScopeContext;

  beforeEach(() => {
    service = new ScopeContext();
  });

  it('starts in global scope', () => {
    expect(service.scope()).toBe('global');
  });

  it('setProject switches scope to project', () => {
    service.setProject('p1');
    expect(service.scope()).toEqual({ kind: 'project', projectId: 'p1' });
  });

  it('setGlobal switches back to global', () => {
    service.setProject('p1');
    service.setGlobal();
    expect(service.scope()).toBe('global');
  });

  it('setProject overrides the previous project', () => {
    service.setProject('p1');
    service.setProject('p2');
    expect(service.scope()).toEqual({ kind: 'project', projectId: 'p2' });
  });
});
