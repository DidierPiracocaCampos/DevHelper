import { PASSWORD_RULES, evaluatePasswordRules, passwordMeetsAllRules } from './password-rules';

describe('password-rules', () => {
  describe('PASSWORD_RULES', () => {
    it('exposes exactly 5 rules with stable keys and labels', () => {
      expect(PASSWORD_RULES.map((r) => r.key)).toEqual([
        'minLength',
        'lower',
        'upper',
        'number',
        'special',
      ]);
      for (const rule of PASSWORD_RULES) {
        expect(typeof rule.label).toBe('string');
        expect(rule.label.length).toBeGreaterThan(0);
        expect(typeof rule.test).toBe('function');
      }
    });

    it('rules have unique keys', () => {
      const keys = PASSWORD_RULES.map((r) => r.key);
      expect(new Set(keys).size).toBe(keys.length);
    });
  });

  describe('evaluatePasswordRules', () => {
    it('returns all false for empty string', () => {
      const states = evaluatePasswordRules('');
      expect(states).toEqual({
        minLength: false,
        lower: false,
        upper: false,
        number: false,
        special: false,
      });
    });

    it('detects min length only when >= 8 chars', () => {
      expect(evaluatePasswordRules('Abcdef1').minLength).toBe(false);
      expect(evaluatePasswordRules('Abcdef1!').minLength).toBe(true);
    });

    it('detects lowercase letter', () => {
      expect(evaluatePasswordRules('ABCDEFG1!').lower).toBe(false);
      expect(evaluatePasswordRules('aBCDEFG1!').lower).toBe(true);
    });

    it('detects uppercase letter', () => {
      expect(evaluatePasswordRules('abcdefg1!').upper).toBe(false);
      expect(evaluatePasswordRules('Abcdefg1!').upper).toBe(true);
    });

    it('detects numeric digit', () => {
      expect(evaluatePasswordRules('Abcdefg!').number).toBe(false);
      expect(evaluatePasswordRules('Abcdef1!').number).toBe(true);
    });

    it('detects special (non-alphanumeric) character', () => {
      expect(evaluatePasswordRules('Abcdef1').special).toBe(false);
      expect(evaluatePasswordRules('Abcdef1!').special).toBe(true);
      expect(evaluatePasswordRules('Abcdef 1').special).toBe(true);
    });

    it('returns all true for a fully compliant password', () => {
      expect(evaluatePasswordRules('Abcdef1!')).toEqual({
        minLength: true,
        lower: true,
        upper: true,
        number: true,
        special: true,
      });
    });
  });

  describe('passwordMeetsAllRules', () => {
    it('returns false for empty', () => {
      expect(passwordMeetsAllRules('')).toBe(false);
    });

    it('returns false when one rule is missing', () => {
      expect(passwordMeetsAllRules('Abcdef1')).toBe(false);
      expect(passwordMeetsAllRules('Abcdefg!')).toBe(false);
      expect(passwordMeetsAllRules('ABCDEFG1!')).toBe(false);
      expect(passwordMeetsAllRules('abcdefg1!')).toBe(false);
      expect(passwordMeetsAllRules('Abcde1!')).toBe(false);
    });

    it('returns true when all rules pass', () => {
      expect(passwordMeetsAllRules('Abcdef1!')).toBe(true);
      expect(passwordMeetsAllRules('Password123#')).toBe(true);
    });
  });
});
