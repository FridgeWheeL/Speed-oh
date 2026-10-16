import { describe, it, expect } from 'vitest';
import { parseMaxspeed, parseMaxspeedFromConditional } from '../src/services/speedLimit.js';

describe('parseMaxspeed', () => {
  it('parses numeric value', () => {
    expect(parseMaxspeed('50')).toBe(50);
  });

  it('parses numeric value with km/h suffix', () => {
    expect(parseMaxspeed('50 km/h')).toBe(50);
  });

  it('parses numeric value with km/h suffix (lowercase)', () => {
    expect(parseMaxspeed('50 km/h')).toBe(50);
  });

  it('parses numeric value with @suffix', () => {
    expect(parseMaxspeed('50@forward')).toBe(50);
  });

  it('returns null for "none"', () => {
    expect(parseMaxspeed('none')).toBe(null);
  });

  it('returns null for empty string', () => {
    expect(parseMaxspeed('')).toBe(null);
  });

  it('returns null for undefined', () => {
    expect(parseMaxspeed(undefined as any)).toBe(null);
  });

  it('returns null for unknown format', () => {
    expect(parseMaxspeed('DE:motorway')).toBe(null);
  });

  it('parses different numeric values', () => {
    expect(parseMaxspeed('30')).toBe(30);
    expect(parseMaxspeed('60')).toBe(60);
    expect(parseMaxspeed('90')).toBe(90);
    expect(parseMaxspeed('120')).toBe(120);
  });

  it('trims whitespace', () => {
    expect(parseMaxspeed('  50  ')).toBe(50);
  });
});

describe('parseMaxspeedFromConditional', () => {
  it('parses simple conditional', () => {
    const result = parseMaxspeedFromConditional('50@06:00-09:00; 70');
    expect(result.get('default')).toBe(70);
    expect(result.has('06:00-09:00')).toBe(true);
  });

  it('returns empty map for empty string', () => {
    const result = parseMaxspeedFromConditional('');
    expect(result.size).toBe(0);
  });

  it('ignores unparseable segments', () => {
    const result = parseMaxspeedFromConditional('foo; 50');
    expect(result.get('default')).toBe(50);
  });
});
