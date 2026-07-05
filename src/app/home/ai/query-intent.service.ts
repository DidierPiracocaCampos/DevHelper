import { Injectable } from '@angular/core';
import type { AiIntent } from './ai-intent.enum';

export interface ClassifyResult {
  intent: AiIntent;
  entity?: string;
}

@Injectable({ providedIn: 'root' })
export class QueryIntentService {
  classify(text: string): ClassifyResult {
    const trimmed = text.trim();
    if (!trimmed) return { intent: 'unknown' };

    const projectMatch = trimmed.match(
      /(?:del?|en)\s+proyecto\s+([\wáéíóúñÁÉÍÓÚÑ\s\-]+?)(?:\s|$)/i,
    );
    if (projectMatch) return { intent: 'by_project', entity: projectMatch[1].trim() };

    const tagMatch = trimmed.match(/(?:con\s+)?(?:tag|etiqueta)\s+([\wáéíóúñÁÉÍÓÚÑ\-]+)/i);
    if (tagMatch) return { intent: 'by_tag', entity: tagMatch[1].trim() };

    const normalized = trimmed.toLowerCase();

    if (/\b(resume|resumen|resumir|s[ií]ntesis)\b/i.test(normalized)) {
      return { intent: 'summary' };
    }
    if (
      /\b(pendiente|pendientes|que\s+falt|que\s+queda|no\s+hechas?|por\s+hacer|me\s+queda|queda|quedan)\b/i.test(
        normalized,
      )
    ) {
      return { intent: 'list_pending' };
    }
    if (
      /\b(hecha|hechas|terminada|terminadas|completada|completadas|hice|hizo|hicieron)\b/i.test(
        normalized,
      )
    ) {
      return { intent: 'list_done' };
    }
    if (/\b(proyecto|proyectos|mis\s+proyectos)\b/i.test(normalized)) {
      return { intent: 'list_projects' };
    }
    if (/\b(vencid|vencidas|atrasad|atrasadas|tarde|fuera\s+de\s+tiempo)\b/i.test(normalized)) {
      return { intent: 'overdue' };
    }
    if (/\bhoy\b/i.test(normalized)) {
      return { intent: 'today' };
    }
    if (/\b(esta\s+semana|semana\s+que\s+viene|pr[oó]xima\s+semana)\b/i.test(normalized)) {
      return { intent: 'this_week' };
    }

    return { intent: 'search' };
  }
}
