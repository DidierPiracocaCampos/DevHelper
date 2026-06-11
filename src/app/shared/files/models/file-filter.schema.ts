import { FilterSchema } from '../../filter/filter.types';
import { FileMetadataI } from './file.model';

export const FILE_FILTER_SCHEMA: FilterSchema<FileMetadataI> = {
  entity: 'files',
  fields: [
    {
      key: 'name',
      label: 'Nombre',
      control: 'text',
      ops: ['==', '!='],
      placeholder: 'ej. contrato',
    },
    {
      key: 'mimeType',
      label: 'Tipo',
      control: 'text',
      ops: ['==', '!='],
      placeholder: 'ej. image/png',
    },
    {
      key: 'tags',
      label: 'Etiqueta',
      control: 'text',
      ops: ['array-contains'],
      placeholder: 'ej. trabajo',
    },
  ],
};
