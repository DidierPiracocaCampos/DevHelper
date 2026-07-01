import { FilterSchema } from '../../shared/filter';
import { IssueI } from '../domain/issue.interface';

export const issueFilterSchema: FilterSchema<IssueI> = {
  entity: 'issues',
  fields: [
    { key: 'title', label: 'Título', control: 'text', ops: ['==', '!='] },
    {
      key: 'status',
      label: 'Estado',
      control: 'select',
      ops: ['==', '!='],
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Hecho', value: 'done' },
      ],
    },
    { key: 'isNote', label: 'Es nota', control: 'boolean', ops: ['==', '!='] },
    {
      key: 'priority',
      label: 'Prioridad',
      control: 'select',
      ops: ['==', '!='],
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Alta', value: 'high' },
      ],
    },
    { key: 'dueAt', label: 'Vencimiento', control: 'date', ops: ['==', '>', '>=', '<', '<='] },
    { key: 'createdAt', label: 'Creado', control: 'date', ops: ['==', '>', '>=', '<', '<='] },
  ],
};
