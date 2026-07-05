import type { IssueI } from '../../domain/issue.interface';

const MAX_LISTED = 5;

export function renderDone(issues: IssueI[]): string {
  if (issues.length === 0) return 'No has completado tareas todavía.';
  if (issues.length === 1) return `Has completado 1 tarea: ${issues[0].title}.`;
  const listed = issues
    .slice(0, MAX_LISTED)
    .map((i) => i.title)
    .join(', ');
  const extra = issues.length - MAX_LISTED;
  const tail = extra > 0 ? ` y ${extra} más` : '';
  return `Has completado ${issues.length} tareas: ${listed}${tail}.`;
}
