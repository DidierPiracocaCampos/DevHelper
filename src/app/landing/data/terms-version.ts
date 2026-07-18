/**
 * Versioning constants for the Terms & Conditions document served at
 * `/legal/terms-es.md` and accepted through the registration flow
 * (`form-register`) and the re-acceptance modal (`terms-modal`).
 *
 * Bump `TERMS_VERSION` whenever `public/legal/terms-es.md` changes in a
 * way that requires explicit user re-consent. The current value mirrors
 * the date stamped at the top of that markdown file.
 */
export const TERMS_VERSION = '2026-07-18';
export const TERMS_LANG = 'es' as const;
