export interface DemoAttachment {
  readonly icon: string;
  readonly label: string;
  readonly meta: string;
}

export interface DemoTask {
  readonly id: string;
  readonly term: string;
  readonly title: string;
  readonly project: string;
  readonly doneAt: string;
  readonly problem: string;
  readonly solution: string;
  readonly keywords: string;
  readonly attachments: readonly DemoAttachment[];
}

/** Illustrative content for the landing demo. It is always labelled as an example in the UI. */
export const DEMO_TASKS: readonly DemoTask[] = [
  {
    id: 'cors',
    term: 'cors',
    title: 'CORS bloqueado tras cambiar de dominio',
    project: 'api-pagos',
    doneAt: '6 nov 2026',
    problem:
      'El front recibe un 403 en el preflight desde el dominio nuevo. En staging funciona. Solo falla en las peticiones con credenciales.',
    solution:
      'El origin de la variable de entorno llevaba una barra final. Con credenciales no vale el comodín: hay que devolver el origin exacto.',
    keywords: 'cors preflight origin dominio nginx proxy 403 credenciales',
    attachments: [
      { icon: 'attach_file', label: 'nginx-prod.conf', meta: 'Archivo cifrado' },
      { icon: 'attach_file', label: 'cabeceras-preflight.txt', meta: 'Archivo cifrado' },
      { icon: 'key', label: 'Panel del proxy', meta: 'Contraseña cifrada' },
    ],
  },
  {
    id: 'migracion',
    term: 'migración',
    title: 'La migración se queda colgada en producción',
    project: 'backoffice',
    doneAt: '2 sep 2025',
    problem:
      'El ALTER TABLE no termina y las peticiones empiezan a acumularse. En local tarda dos segundos porque la tabla está casi vacía.',
    solution:
      'Una transacción larga retenía el lock de la tabla. Añadí lock_timeout a la migración y creé el índice con CONCURRENTLY, fuera de la transacción.',
    keywords: 'migracion postgres sql alter table lock indice concurrently base de datos',
    attachments: [
      { icon: 'attach_file', label: 'consulta-locks.sql', meta: 'Archivo cifrado' },
      { icon: 'key', label: 'Postgres producción', meta: 'Contraseña cifrada' },
    ],
  },
  {
    id: 'certificado',
    term: 'certificado',
    title: 'La renovación del certificado devuelve 404',
    project: 'infra-personal',
    doneAt: '21 ene 2026',
    problem:
      "Let's Encrypt no puede validar el dominio. El reto HTTP-01 responde 404 aunque el archivo existe en el servidor.",
    solution:
      'nginx redirigía /.well-known/acme-challenge/ hacia el front. Excluí esa ruta de la redirección y la renovación pasó a la primera.',
    keywords: 'certificado ssl tls https lets encrypt acme nginx renovacion 404',
    attachments: [
      { icon: 'attach_file', label: 'sites-enabled.conf', meta: 'Archivo cifrado' },
      { icon: 'key', label: 'Acceso al VPS', meta: 'Contraseña cifrada' },
    ],
  },
];

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function findDemoTask(query: string): DemoTask | null {
  const needle = normalize(query);
  if (!needle) return DEMO_TASKS[0];
  return (
    DEMO_TASKS.find((task) =>
      normalize(`${task.title} ${task.problem} ${task.solution} ${task.keywords}`).includes(needle),
    ) ?? null
  );
}
