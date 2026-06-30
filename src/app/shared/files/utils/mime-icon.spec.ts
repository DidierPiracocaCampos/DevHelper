import { describe, it, expect } from 'vitest';
import { iconFor } from './mime-icon';

describe('iconFor', () => {
  it('image/* -> image', () => {
    expect(iconFor('image/png')).toBe('image');
    expect(iconFor('image/jpeg')).toBe('image');
    expect(iconFor('image/webp')).toBe('image');
  });

  it('application/pdf -> picture_as_pdf', () => {
    expect(iconFor('application/pdf')).toBe('picture_as_pdf');
  });

  it('video/* -> movie', () => {
    expect(iconFor('video/mp4')).toBe('movie');
    expect(iconFor('video/webm')).toBe('movie');
  });

  it('audio/* -> audio_file', () => {
    expect(iconFor('audio/mpeg')).toBe('audio_file');
    expect(iconFor('audio/wav')).toBe('audio_file');
  });

  it('texto, json y desconocidos -> description', () => {
    expect(iconFor('text/plain')).toBe('description');
    expect(iconFor('application/json')).toBe('description');
    expect(iconFor('')).toBe('description');
    expect(iconFor('application/octet-stream')).toBe('description');
  });
});
