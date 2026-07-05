import type { AiMatchedDoc } from '../ai-result.model';

export function renderSearch(matches: AiMatchedDoc[]): string {
  if (matches.length === 0) return 'No encontré coincidencias para tu búsqueda.';
  if (matches.length === 1) {
    const m = matches[0];
    return `Encontré 1 coincidencia: ${m.title} (de ${m.collection}, relevancia ${m.score.toFixed(2)}).`;
  }
  const listed = matches
    .map((m) => `${m.title} (de ${m.collection}, relevancia ${m.score.toFixed(2)})`)
    .join(', ');
  return `Encontré ${matches.length} coincidencias: ${listed}.`;
}
