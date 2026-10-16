export function parseMaxspeed(maxspeed: string): number | null {
  if (!maxspeed) return null;

  const trimmed = maxspeed.trim();

  if (trimmed === 'none') return null;

  const numericMatch = trimmed.match(/^(\d+)\s*(?:km\/h)?$/i);
  if (numericMatch) {
    return parseInt(numericMatch[1], 10);
  }

  const conditionalMatch = trimmed.match(/^(\d+)\s*(@.+)?$/);
  if (conditionalMatch) {
    return parseInt(conditionalMatch[1], 10);
  }

  return null;
}

export function parseMaxspeedFromConditional(conditional: string): Map<string, number | null> {
  const result = new Map<string, number | null>();
  if (!conditional) return result;

  const segments = conditional.split(';');
  for (const segment of segments) {
    const match = segment.trim().match(/^(\d+)\s*(?:(?:km\/h)|@.+)?$/i);
    if (match) {
      const timeMatch = segment.trim().match(/@(.+)$/);
      const value = parseInt(match[1], 10);
      if (timeMatch) {
        result.set(timeMatch[1], value);
      } else {
        result.set('default', value);
      }
    }
  }

  return result;
}
