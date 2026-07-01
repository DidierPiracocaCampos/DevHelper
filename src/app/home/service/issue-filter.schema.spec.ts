import { describe, it, expect } from 'vitest';
import { issueFilterSchema } from './issue-filter.schema';

describe('issueFilterSchema', () => {
  it('uses the entity name "issues"', () => {
    expect(issueFilterSchema.entity).toBe('issues');
  });

  it('exposes filters for title, status, isNote, priority, dueAt, createdAt', () => {
    const keys = issueFilterSchema.fields.map((f) => f.key);
    expect(keys).toEqual(
      expect.arrayContaining(['title', 'status', 'isNote', 'priority', 'dueAt', 'createdAt']),
    );
  });

  it('status filter only allows == and != (select-style enum)', () => {
    const status = issueFilterSchema.fields.find((f) => f.key === 'status');
    expect(status?.control).toBe('select');
    expect(status?.ops).toEqual(['==', '!=']);
  });

  it('isNote and priority use boolean control', () => {
    const isNote = issueFilterSchema.fields.find((f) => f.key === 'isNote');
    const priority = issueFilterSchema.fields.find((f) => f.key === 'priority');
    expect(isNote?.control).toBe('boolean');
    expect(priority?.control).toBe('select');
    expect(priority?.ops).toEqual(['==', '!=']);
  });

  it('dueAt and createdAt use date control', () => {
    const dueAt = issueFilterSchema.fields.find((f) => f.key === 'dueAt');
    const createdAt = issueFilterSchema.fields.find((f) => f.key === 'createdAt');
    expect(dueAt?.control).toBe('date');
    expect(createdAt?.control).toBe('date');
  });
});
