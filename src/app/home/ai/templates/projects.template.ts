import type { ProjectI } from '../../domain/project.interface';

export function renderProjects(projects: ProjectI[]): string {
  if (projects.length === 0) return 'No tienes proyectos activos.';
  if (projects.length === 1) return `Tienes 1 proyecto activo: ${projects[0].name}.`;
  return `Tienes ${projects.length} proyectos activos: ${projects.map((p) => p.name).join(', ')}.`;
}
