import { inject, Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    const html = renderMarkdown(value);
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CODE_TOKEN = '\u0000C';
const LINK_TOKEN = '\u0000L';

function renderInline(text: string): string {
  const codeStash: string[] = [];
  const withoutCode = text.replace(/`([^`]+)`/g, (_, code: string) => {
    const idx = codeStash.length;
    codeStash.push(escapeHtml(code));
    return `${CODE_TOKEN}${idx}\u0000`;
  });

  const linkStash: string[] = [];
  const withoutLinks = withoutCode.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, label: string, url: string) => {
      const idx = linkStash.length;
      const safeLabel = escapeHtml(label).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      linkStash.push(`<a href="${escapeHtml(url)}">${safeLabel}</a>`);
      return `${LINK_TOKEN}${idx}\u0000`;
    },
  );

  let out = escapeHtml(withoutLinks);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(
    new RegExp(`${LINK_TOKEN}(\\d+)\u0000`, 'g'),
    (_, idx: string) => linkStash[Number(idx)],
  );
  out = out.replace(
    new RegExp(`${CODE_TOKEN}(\\d+)\u0000`, 'g'),
    (_, idx: string) => `<code>${codeStash[Number(idx)]}</code>`,
  );
  return out;
}

function isBlockStart(line: string): boolean {
  return /^#{1,3} /.test(line) || /^[-*] /.test(line) || /^\d+\. /.test(line) || /^> /.test(line);
}

function renderMarkdown(input: string): string {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    if (/^# /.test(line)) {
      out.push(`<h1>${renderInline(line.slice(2))}</h1>`);
      i++;
      continue;
    }

    if (/^## /.test(line)) {
      out.push(`<h2>${renderInline(line.slice(3))}</h2>`);
      i++;
      continue;
    }

    if (/^### /.test(line)) {
      out.push(`<h3>${renderInline(line.slice(4))}</h3>`);
      i++;
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].slice(2))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\. /, ''))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    if (/^> /.test(line)) {
      const quotes: string[] = [];
      while (i < lines.length && /^> /.test(lines[i])) {
        quotes.push(renderInline(lines[i].slice(2)));
        i++;
      }
      out.push(`<blockquote><p>${quotes.join(' ')}</p></blockquote>`);
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) {
      paragraph.push(lines[i]);
      i++;
    }
    out.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return out.join('');
}
