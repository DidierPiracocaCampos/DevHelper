import type { IssueI } from '../../domain/issue.interface';
import { Timestamp } from '@angular/fire/firestore';

const MAX_LISTED = 5;
const DATE_FMT = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

function toDate(dueAt: Timestamp | Date | undefined): Date | null {
  if (!dueAt) return null;
  return dueAt instanceof Date ? dueAt : dueAt.toDate();
}

export function renderOverdue(issues: IssueI[]): string {
  if (issues.length === 0) return 'No tienes tareas vencidas. Bien hecho.';
  if (issues.length === 1) {
    const d = toDate(issues[0].dueAt);
    const dateStr = d ? DATE_FMT.format(d) : 'sin fecha';
    return `Tienes 1 tarea vencida: ${issues[0].title} (vencía el ${dateStr}).`;
  }
  const listed = issues
    .slice(0, MAX_LISTED)
    .map((i) => i.title)
    .join(', ');
  const extra = issues.length - MAX_LISTED;
  const tail = extra > 0 ? ` y ${extra} más` : '';
  return `Tienes ${issues.length} tareas vencidas: ${listed}${tail}.`;
}
