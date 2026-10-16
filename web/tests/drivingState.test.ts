import { describe, it, expect } from 'vitest';
import { evaluateDrivingState, resetDrivingState } from '../src/services/drivingState.js';
import type { GpsPosition, RoadSegment } from '../src/types.js';

function makePosition(speedMs: number | null): GpsPosition {
  return {
    latitude: 51.5074,
    longitude: -0.1278,
    speed: speedMs,
    accuracy: 5,
    timestamp: Date.now(),
    heading: null,
  };
}

function makeRoad(speedKmh: number | null): RoadSegment {
  return {
    id: 'test-road',
    name: 'Test Street',
    maxspeed: speedKmh,
    oneway: false,
    ref: null,
    distance: 5,
    confidence: 0.9,
    highway: 'residential',
  };
}

describe('evaluateDrivingState', () => {
  beforeEach(() => {
    resetDrivingState();
  });

  describe('no GPS', () => {
    it('returns no_gps when position is null', () => {
      const state = evaluateDrivingState(null, 50, makeRoad(60), 50);
      expect(state.type).toBe('no_gps');
      expect(state.currentSpeedKmh).toBeNull();
    });

    it('returns no_gps when speed is null', () => {
      const position = makePosition(null);
      const state = evaluateDrivingState(position, 50, makeRoad(60), 50);
      expect(state.type).toBe('no_gps');
    });
  });

  describe('speed limit unavailable', () => {
    it('returns unknown_limit when road has no speed limit', () => {
      const state = evaluateDrivingState(
        makePosition(15),
        54,
        makeRoad(null),
        54
      );
      expect(state.type).toBe('unknown_limit');
      expect(state.limitAvailable).toBe(false);
    });
  });

  describe('below speed limit', () => {
    it('returns below when significantly under limit', () => {
      const state = evaluateDrivingState(
        makePosition(13.89),
        50,
        makeRoad(70),
        50
      );
      expect(state.type).toBe('below');
      expect(state.limitAvailable).toBe(true);
    });
  });

  describe('approaching speed limit', () => {
    it('returns approaching when within threshold of limit', () => {
      const state = evaluateDrivingState(
        makePosition(16.11),
        58,
        makeRoad(60),
        58
      );
      expect(state.type).toBe('approaching');
    });
  });

  describe('at speed limit', () => {
    it('returns at when exactly at limit', () => {
      const state = evaluateDrivingState(
        makePosition(16.67),
        60,
        makeRoad(60),
        60
      );
      expect(state.type).toBe('at');
    });
  });

  describe('above speed limit', () => {
    it('returns above when significantly over limit', () => {
      const state = evaluateDrivingState(
        makePosition(22.22),
        80,
        makeRoad(60),
        80
      );
      expect(state.type).toBe('above');
      expect(state.limitAvailable).toBe(true);
    });
  });

  describe('hysteresis', () => {
    it('prevents flickering when dropping from at to just below', () => {
      const road = makeRoad(60);

      let state = evaluateDrivingState(
        makePosition(16.67),
        60,
        road,
        60
      );
      expect(state.type).toBe('at');

      state = evaluateDrivingState(
        makePosition(16.11),
        58,
        road,
        58
      );
      expect(state.type).toBe('at');
    });

    it('stays at when dropping further after hysteresis applied', () => {
      const road = makeRoad(60);

      evaluateDrivingState(
        makePosition(16.67),
        60,
        road,
        60
      );

      let state = evaluateDrivingState(
        makePosition(16.11),
        58,
        road,
        58
      );
      expect(state.type).toBe('at');

      state = evaluateDrivingState(
        makePosition(15.83),
        57,
        road,
        57
      );
      expect(state.type).toBe('at');
    });
  });

  describe('road name', () => {
    it('includes road name in state', () => {
      const state = evaluateDrivingState(
        makePosition(13.89),
        50,
        makeRoad(70),
        50
      );
      expect(state.roadName).toBe('Test Street');
    });
  });
});
