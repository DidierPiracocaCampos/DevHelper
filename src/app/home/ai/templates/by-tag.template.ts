import type { IssueI } from '../../domain/issue.interface';

const MAX_LISTED = 5;

export function renderByTag(tag: string, issues: IssueI[]): string {
  if (issues.length === 0) return `No hay tareas con el tag "${tag}".`;
  if (issues.length === 1) return `Hay 1 tarea con el tag "${tag}": ${issues[0].title}.`;
  const listed = issues
    .slice(0, MAX_LISTED)
    .map((i) => i.title)
    .join(', ');
  const extra = issues.length - MAX_LISTED;
  const tail = extra > 0 ? ` y ${extra} más` : '';
  return `Hay ${issues.length} tareas con el tag "${tag}": ${listed}${tail}.`;
}
