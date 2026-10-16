import { describe, it, expect } from 'vitest';
import { msToKmh, kmhToMs, isValidSpeed } from '../src/utils/conversions.js';

describe('msToKmh', () => {
  it('converts 0 m/s to 0 km/h', () => {
    expect(msToKmh(0)).toBe(0);
  });

  it('converts 1 m/s to 3.6 km/h', () => {
    expect(msToKmh(1)).toBe(4);
  });

  it('converts 10 m/s to 36 km/h', () => {
    expect(msToKmh(10)).toBe(36);
  });

  it('converts 27.78 m/s to ~100 km/h', () => {
    expect(msToKmh(27.78)).toBe(100);
  });

  it('rounds correctly', () => {
    expect(msToKmh(16.67)).toBe(60);
  });
});

describe('kmhToMs', () => {
  it('converts 0 km/h to 0 m/s', () => {
    expect(kmhToMs(0)).toBe(0);
  });

  it('converts 36 km/h to 10 m/s', () => {
    expect(kmhToMs(36)).toBeCloseTo(10, 5);
  });

  it('converts 72 km/h to 20 m/s', () => {
    expect(kmhToMs(72)).toBeCloseTo(20, 5);
  });
});

describe('isValidSpeed', () => {
  it('accepts valid positive speed', () => {
    expect(isValidSpeed(10)).toBe(true);
  });

  it('accepts zero speed', () => {
    expect(isValidSpeed(0)).toBe(true);
  });

  it('rejects negative speed', () => {
    expect(isValidSpeed(-1)).toBe(false);
  });

  it('rejects null', () => {
    expect(isValidSpeed(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isValidSpeed(undefined)).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(isValidSpeed(Infinity)).toBe(false);
  });

  it('rejects NaN', () => {
    expect(isValidSpeed(NaN)).toBe(false);
  });
});
