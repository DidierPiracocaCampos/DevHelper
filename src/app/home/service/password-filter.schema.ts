import { FilterSchema } from '../../shared/filter';
import { PasswordI } from '../domain/password.interface';

export const passwordFilterSchema: FilterSchema<PasswordI> = {
  entity: 'passwords',
  fields: [
    { key: 'name', label: 'Nombre', control: 'text', ops: ['==', '!='] },
    { key: 'createdAt', label: 'Creado', control: 'date', ops: ['==', '>', '>=', '<', '<='] },
  ],
};
