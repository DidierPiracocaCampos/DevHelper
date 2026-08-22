import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect } from 'vitest';
import { SectionFeatures } from './section-features';

describe('SectionFeatures', () => {
  let fixture: ComponentFixture<SectionFeatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFeatures],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionFeatures);
    fixture.detectChanges();
  });

  it('renders the section heading', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Todo el contexto de tu trabajo, conectado.');
    expect(html).toContain(
      'Guarda cada decisión, tarea, archivo y secreto donde volverás a encontrarlo.',
    );
  });

  it('renders six feature tiles', () => {
    const tiles = fixture.nativeElement.querySelectorAll('[data-feature]');
    expect(tiles.length).toBe(6);
  });

  it('uses the documented card size for every feature tile', () => {
    const tiles = fixture.nativeElement.querySelectorAll('[data-feature]');

    for (const tile of tiles) {
      expect((tile as HTMLElement).classList).toContain('card-xl');
    }
  });

  it('includes Archivos as its own feature', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).toContain('Archivos listos cuando vuelvan a hacer falta');
  });

  it('renders the six required feature titles and descriptions', () => {
    const root = fixture.nativeElement as HTMLElement;
    const expected = [
      [
        'Un vault que solo tú puedes abrir',
        'AES-GCM 256 con PIN o Passkey (WebAuthn). Tu clave maestra nunca sale del navegador.',
      ],
      [
        'Proyectos con todo su contexto',
        'Organiza por proyecto: tareas con vencimiento o notas libres, con espacio para adjuntos y secretos.',
      ],
      [
        'Archivos listos cuando vuelvan a hacer falta',
        'Adjuntos globales o por tarea. Se parten en chunks y viven bajo el mismo vault. Hasta 5 MB por fichero.',
      ],
      [
        'Credenciales junto al trabajo que las necesita',
        'Secretos cifrados en cliente: globales o ligados a una tarea concreta.',
      ],
      [
        'Eventos y recordatorios sin salir del workspace',
        'Compromisos globales en una sola vista, junto al resto del workspace.',
      ],
      [
        'Una IA local para consultar tu memoria técnica',
        'Opt-in explícito. 100% en tu dispositivo. Consultas estructuradas sobre tu workspace.',
      ],
    ];

    const tiles = Array.from(root.querySelectorAll('[data-feature]'));
    expect(
      tiles.map((tile) => [
        tile.querySelector('h3')?.textContent?.trim(),
        tile.querySelector('p')?.textContent?.trim(),
      ]),
    ).toEqual(expected);
  });

  it('marks two large tiles: vault and projects-tasks', () => {
    const root = fixture.nativeElement as HTMLElement;
    const large = root.querySelectorAll('[data-feature-size="large"]');
    expect(large.length).toBe(2);
    const ids = Array.from(large).map((el) => el.getAttribute('data-feature'));
    expect(ids).toContain('vault');
    expect(ids).toContain('projects-tasks');
  });

  it('renders no status badges (all features are live)', () => {
    const html = fixture.nativeElement.textContent as string;
    expect(html).not.toContain('Disponible');
    expect(html).not.toContain('Vista previa');
  });

  it('renders six images, one per feature', () => {
    const root = fixture.nativeElement as HTMLElement;
    const imgs = root.querySelectorAll('img');
    expect(imgs.length).toBe(6);
  });

  it('renders the exact asset metadata for every feature image', () => {
    const root = fixture.nativeElement as HTMLElement;
    const assets = new Map([
      [
        'vault',
        {
          src: '/img/landing/vault.png',
          width: '1280',
          height: '490',
          ratio: '1280 / 490',
        },
      ],
      [
        'projects-tasks',
        {
          src: '/img/landing/projects-tasks.png',
          width: '1200',
          height: '490',
          ratio: '1200 / 490',
        },
      ],
      ['files', { src: '/img/landing/files.png', width: '800', height: '500', ratio: '800 / 500' }],
      [
        'passwords',
        { src: '/img/landing/passwords.png', width: '800', height: '500', ratio: '800 / 500' },
      ],
      [
        'events',
        { src: '/img/landing/events.png', width: '800', height: '500', ratio: '800 / 500' },
      ],
      ['ai', { src: '/img/landing/ai.png', width: '800', height: '500', ratio: '800 / 500' }],
    ]);

    for (const [featureId, asset] of assets) {
      const tile = root.querySelector(`[data-feature="${featureId}"]`);
      const image = tile?.querySelector('img');
      const figure = tile?.querySelector('figure');

      expect(image?.getAttribute('src')).toBe(asset.src);
      expect(image?.getAttribute('width')).toBe(asset.width);
      expect(image?.getAttribute('height')).toBe(asset.height);
      expect((figure as HTMLElement | null)?.style.getPropertyValue('--feature-ratio')).toBe(
        asset.ratio,
      );
    }
  });

  it('marks feature icons and highlight checks as decorative', () => {
    const root = fixture.nativeElement as HTMLElement;
    const sectionIcon = root.querySelector('.badge .icon');
    const featureIcons = root.querySelectorAll('[data-feature] .section-features__icon-chip .icon');
    const checkIcons = root.querySelectorAll('[data-feature] li .icon');

    expect(sectionIcon).not.toBeNull();
    expect(featureIcons.length).toBe(6);
    expect(checkIcons.length).toBe(6);
    for (const icon of [sectionIcon, ...featureIcons, ...checkIcons]) {
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('emits lg:card-side on compact tiles with images', () => {
    const root = fixture.nativeElement as HTMLElement;
    const compact = root.querySelectorAll('[data-feature-size="compact"]');
    expect(compact.length).toBe(4);
    for (const tile of compact) {
      expect((tile as HTMLElement).className).toContain('lg:card-side');
    }
  });

  it('renders a card body and figure with the expected classes for every feature', () => {
    const root = fixture.nativeElement as HTMLElement;
    const tiles = root.querySelectorAll('[data-feature]');

    for (const tile of tiles) {
      expect(tile.querySelector(':scope > .card-body')).not.toBeNull();
      expect(
        tile.querySelector(':scope > figure.section-features__visual.section-features__figure'),
      ).not.toBeNull();
    }
  });
});
