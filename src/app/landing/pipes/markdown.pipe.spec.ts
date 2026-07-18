import { TestBed } from '@angular/core/testing';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new MarkdownPipe());
  });

  function render(value: string): string {
    const out = pipe.transform(value);
    return typeof out === 'string' ? out : (out as unknown as string);
  }

  it('renders empty input as empty string', () => {
    expect(render('')).toBe('');
  });

  it('renders null input as empty string', () => {
    const out = pipe.transform(null);
    expect(out).toBe('');
  });

  it('renders H1', () => {
    expect(render('# Titulo')).toBe('<h1>Titulo</h1>');
  });

  it('renders H2', () => {
    expect(render('## Subt')).toBe('<h2>Subt</h2>');
  });

  it('renders H3', () => {
    expect(render('### Seccion')).toBe('<h3>Seccion</h3>');
  });

  it('renders paragraphs separated by blank lines', () => {
    const input = 'Primero.\n\nSegundo.';
    expect(render(input)).toBe('<p>Primero.</p><p>Segundo.</p>');
  });

  it('renders unordered list with dash', () => {
    const input = '- uno\n- dos\n- tres';
    expect(render(input)).toBe('<ul><li>uno</li><li>dos</li><li>tres</li></ul>');
  });

  it('renders unordered list with asterisk', () => {
    const input = '* uno\n* dos';
    expect(render(input)).toBe('<ul><li>uno</li><li>dos</li></ul>');
  });

  it('renders ordered list', () => {
    const input = '1. uno\n2. dos\n3. tres';
    expect(render(input)).toBe('<ol><li>uno</li><li>dos</li><li>tres</li></ol>');
  });

  it('renders bold', () => {
    expect(render('esto es **fuerte** aqui')).toBe('<p>esto es <strong>fuerte</strong> aqui</p>');
  });

  it('renders links', () => {
    expect(render('ver [docs](https://example.com) por favor')).toBe(
      '<p>ver <a href="https://example.com">docs</a> por favor</p>',
    );
  });

  it('renders blockquote', () => {
    expect(render('> hola mundo')).toBe('<blockquote><p>hola mundo</p></blockquote>');
  });

  it('renders inline code', () => {
    expect(render('usar `npm install` antes')).toBe('<p>usar <code>npm install</code> antes</p>');
  });

  it('escapes raw HTML inside text', () => {
    const out = render('hola <strong>mundo</strong>');
    expect(out).not.toContain('<strong>mundo</strong>');
    expect(out).toContain('&lt;strong&gt;mundo&lt;/strong&gt;');
  });

  it('strips raw <script> tags', () => {
    const out = render('<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('</script>');
  });

  it('strips raw <iframe> tags', () => {
    const out = render('<iframe src="https://evil.example"></iframe>');
    expect(out).not.toContain('<iframe');
    expect(out).not.toContain('</iframe>');
  });
});
