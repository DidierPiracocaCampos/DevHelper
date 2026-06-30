export type MimeIcon = 'image' | 'picture_as_pdf' | 'movie' | 'audio_file' | 'description';

export function iconFor(mime: string): MimeIcon {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'picture_as_pdf';
  if (mime.startsWith('video/')) return 'movie';
  if (mime.startsWith('audio/')) return 'audio_file';
  return 'description';
}
