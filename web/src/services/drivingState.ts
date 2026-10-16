import type { GpsPosition, RoadSegment, DrivingState, DrivingStateType } from '../types.js';
import { CONFIG } from '../config.js';
import { isValidSpeed } from '../utils/conversions.js';

let previousState: DrivingStateType = 'none';

export function evaluateDrivingState(
  position: GpsPosition | null,
  smoothedSpeedKmh: number | null,
  road: RoadSegment | null,
  displaySpeedKmh: number | null
): DrivingState {
  const roadName = road?.name ?? null;

  if (!position || !isValidSpeed(position.speed)) {
    previousState = 'no_gps';
    return {
      type: 'no_gps',
      currentSpeedKmh: null,
      speedLimitKmh: road?.maxspeed ?? null,
      limitAvailable: false,
      roadName,
    };
  }

  const currentSpeed = displaySpeedKmh ?? smoothedSpeedKmh;

  if (currentSpeed === null) {
    previousState = 'no_gps';
    return {
      type: 'no_gps',
      currentSpeedKmh: null,
      speedLimitKmh: road?.maxspeed ?? null,
      limitAvailable: false,
      roadName,
    };
  }

  if (road === null || road.maxspeed === null) {
    if (previousState === 'unknown_limit' || previousState === 'above') {
      previousState = 'unknown_limit';
    }
    return {
      type: 'unknown_limit',
      currentSpeedKmh: currentSpeed,
      speedLimitKmh: null,
      limitAvailable: false,
      roadName,
    };
  }

  const limit = road.maxspeed;
  const diff = currentSpeed - limit;
  const approachingThreshold = CONFIG.drivingState.approachingThreshold;
  const atThreshold = CONFIG.drivingState.atThreshold;
  const hysteresis = CONFIG.drivingState.hysteresis;

  let newState: DrivingStateType;

  if (diff > atThreshold + hysteresis) {
    newState = 'above';
  } else if (diff > -atThreshold - hysteresis && diff <= atThreshold + hysteresis) {
    newState = diff >= 0 ? 'at' : 'approaching';
  } else if (currentSpeed >= limit - approachingThreshold) {
    newState = 'approaching';
  } else {
    newState = 'below';
  }

  if (previousState === 'above' && newState !== 'above' && diff < -hysteresis) {
    newState = 'above';
  }

  if (previousState === 'at' && newState === 'approaching') {
    newState = 'at';
  }

  previousState = newState;

  return {
    type: newState,
    currentSpeedKmh: currentSpeed,
    speedLimitKmh: limit,
    limitAvailable: true,
    roadName,
  };
}

export function resetDrivingState(): void {
  previousState = 'none';
}
