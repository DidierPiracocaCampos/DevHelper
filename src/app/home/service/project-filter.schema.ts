import { FilterSchema } from '../../shared/filter';
import { ProjectI } from '../domain/project.interface';

export const projectFilterSchema: FilterSchema<ProjectI> = {
  entity: 'proyectos',
  fields: [
    { key: 'name', label: 'Nombre', control: 'text', ops: ['==', '!='] },
    { key: 'tag', label: 'Tag', control: 'text', ops: ['==', '!='] },
    { key: 'archived', label: 'Archivado', control: 'boolean', ops: ['==', '!='] },
    { key: 'createdAt', label: 'Creado', control: 'date', ops: ['==', '>', '>=', '<', '<='] },
  ],
};
