import type { IssueI } from '../../domain/issue.interface';

const MAX_EXTRACTED = 3;

export function renderSummary(projectName: string, issues: IssueI[]): string {
  if (issues.length === 0) return `No hay contenido para resumir en ${projectName}.`;
  const top = issues
    .slice(0, MAX_EXTRACTED)
    .map((i) => i.title)
    .join(', ');
  return `El modo actual no genera resúmenes libres. Estos son los puntos clave de tu proyecto ${projectName}: ${top}.`;
}
