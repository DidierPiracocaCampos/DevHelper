import type { IssueI } from '../../domain/issue.interface';

const MAX_LISTED = 5;

export function renderWeek(issues: IssueI[]): string {
  if (issues.length === 0) return 'No tienes tareas para esta semana.';
  if (issues.length === 1) return `Tienes 1 tarea esta semana: ${issues[0].title}.`;
  const listed = issues
    .slice(0, MAX_LISTED)
    .map((i) => i.title)
    .join(', ');
  const extra = issues.length - MAX_LISTED;
  const tail = extra > 0 ? ` y ${extra} más` : '';
  return `Tienes ${issues.length} tareas esta semana: ${listed}${tail}.`;
}
