export function sanitizeText(input: string, maxLength = 200): string {
  return input.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength);
}
