export function humanizeKey(key: string): string {
  return key
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, l => l.toUpperCase());
}

export function hasTemplateVariable(value: string): boolean {
  return typeof value === 'string' && /\{\{.*?\}\}/.test(value);
}
