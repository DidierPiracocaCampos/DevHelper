export interface PasswordRule {
  key: 'minLength' | 'lower' | 'upper' | 'number' | 'special';
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  { key: 'minLength', label: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
  { key: 'lower', label: 'Letra minúscula', test: (v) => /[a-z]/.test(v) },
  { key: 'upper', label: 'Letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { key: 'number', label: 'Número', test: (v) => /[0-9]/.test(v) },
  { key: 'special', label: 'Carácter especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export type PasswordRuleKey = PasswordRule['key'];

export type PasswordRuleStates = Record<PasswordRuleKey, boolean>;

export function evaluatePasswordRules(value: string): PasswordRuleStates {
  const acc = {} as PasswordRuleStates;
  for (const rule of PASSWORD_RULES) acc[rule.key] = rule.test(value);
  return acc;
}

export function passwordMeetsAllRules(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}
