import { describe, it, expect } from 'vitest';
import { SpeedFilter } from '../src/services/speedFilter.js';

describe('SpeedFilter', () => {
  it('returns first valid speed on initialization', () => {
    const filter = new SpeedFilter();
    const result = filter.update(10);
    expect(result).toBe(36);
  });

  it('applies EMA smoothing to subsequent readings', () => {
    const filter = new SpeedFilter();
    filter.update(10);
    const result = filter.update(20);
    expect(result).toBeCloseTo(48.6, 1);
  });

  it('ignores negative speeds - next valid input uses previous valid', () => {
    const filter = new SpeedFilter();
    filter.update(10);
    filter.update(-5);
    filter.update(20);
    const result = filter.update(30);
    // update(20) smooths from 36 (ignored -5) → ~48.6, then update(30) → ~69.4
    expect(result).toBeCloseTo(69.4, 1);
  });

  it('ignores null speeds', () => {
    const filter = new SpeedFilter();
    filter.update(10);
    filter.update(null);
    filter.update(20);
    const result = filter.update(30);
    expect(result).toBeCloseTo(69.4, 1);
  });

  it('ignores speeds above max valid', () => {
    const filter = new SpeedFilter();
    filter.update(10);
    filter.update(200);
    filter.update(20);
    const result = filter.update(30);
    expect(result).toBeCloseTo(69.4, 1);
  });

  it('ignores NaN speeds', () => {
    const filter = new SpeedFilter();
    filter.update(10);
    filter.update(NaN);
    filter.update(20);
    const result = filter.update(30);
    expect(result).toBeCloseTo(69.4, 1);
  });

  it('ignores Infinity speeds', () => {
    const filter = new SpeedFilter();
    filter.update(10);
    filter.update(Infinity);
    filter.update(20);
    const result = filter.update(30);
    expect(result).toBeCloseTo(69.4, 1);
  });

  it('returns previous smoothed value when input is null', () => {
    const filter = new SpeedFilter();
    filter.update(10);
    const result = filter.update(null);
    expect(result).toBe(36);
  });

  it('resets on reset call', () => {
    const filter = new SpeedFilter();
    filter.update(10);
    filter.update(20);
    filter.reset();
    const result = filter.update(30);
    expect(result).toBe(108);
  });
});
