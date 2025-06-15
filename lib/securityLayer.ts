import DOMPurify from 'dompurify';

export class SecurityLayer {
  static sanitize(markdown: string): string {
    return DOMPurify.sanitize(markdown);
  }
}
