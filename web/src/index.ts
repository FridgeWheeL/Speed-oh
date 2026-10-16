import { GpsService } from './services/gps.js';
import { queryRoads } from './services/overpass.js';
import { SpeedFilter } from './services/speedFilter.js';
import { evaluateDrivingState, resetDrivingState } from './services/drivingState.js';
import {
  requestWakeLock,
  releaseWakeLock,
  setupWakeLockVisibilityListener,
} from './services/wakeLock.js';
import { initCache, getCachedRoad, setCachedRoad } from './services/cache.js';
import { isValidSpeed, msToKmh } from './utils/conversions.js';
import * as ui from './ui/app.js';
import type { GpsPosition, AppStatus, RoadSegment } from './types.js';

let isDriving = false;
let lastQueryTime = 0;
let cachedRoad: { lat: number; lng: number; road: RoadSegment } | null = null;
let lastSmoothedSpeed: number | null = null;

const speedFilter = new SpeedFilter();
let currentDisplaySpeed: number | null = null;

async function init(): Promise<void> {
  await initCache();
  setupWakeLockVisibilityListener(onWakeLockRestore);
  ui.onToggleClick(onToggleClick);
  ui.showSplash();
}

function onToggleClick(): void {
  if (isDriving) {
    stopDriving();
  } else {
    startDriving();
  }
}

async function startDriving(): Promise<void> {
  isDriving = true;
  ui.showDriving();
  ui.setToggleText('Stop Driving');
  (document.querySelector('.toggle-btn') as HTMLButtonElement).classList.add('stop');

  resetDrivingState();
  speedFilter.reset();
  lastQueryTime = 0;
  lastSmoothedSpeed = null;
  currentDisplaySpeed = null;

  await requestWakeLock();

  const gpsService = new GpsService(onGpsPosition);
  gpsService.start();
}

function stopDriving(): void {
  isDriving = false;
  ui.showSplash();

  releaseWakeLock();
  resetDrivingState();
}

async function onGpsPosition(position: GpsPosition | null, status?: AppStatus): Promise<void> {
  if (status) {
    ui.updateStatus(status);
    if (status === 'gps-denied' || status === 'gps-unavailable') {
      stopDriving();
      return;
    }
  } else {
    ui.updateStatus(null);
  }

  if (!position) return;

  const filteredSpeed = speedFilter.update(position.speed);
  currentDisplaySpeed = filteredSpeed;

  if (lastSmoothedSpeed !== null && currentDisplaySpeed !== lastSmoothedSpeed) {
    ui.updateSpeed(currentDisplaySpeed);
  }
  lastSmoothedSpeed = currentDisplaySpeed;

  const now = Date.now();
  if (now - lastQueryTime < 5000) {
    updateDrivingStateFromCached(position);
    return;
  }

  lastQueryTime = now;

  const cached = await getCachedRoad(position.latitude, position.longitude);
  if (cached && cached.speedLimit !== null) {
    const matchingRoad = findRoadFromCache(cached);
    if (matchingRoad) {
      cachedRoad = { lat: position.latitude, lng: position.longitude, road: matchingRoad };
      updateDrivingState(position, matchingRoad);
      return;
    }
  }

  const roads = await queryRoads(position.latitude, position.longitude, onOverpassStatus);
  if (roads.length > 0) {
    const bestRoad = roads[0];

    if (bestRoad.maxspeed !== null) {
      await setCachedRoad(position.latitude, position.longitude, bestRoad);
    }

    cachedRoad = { lat: position.latitude, lng: position.longitude, road: bestRoad };
    updateDrivingState(position, bestRoad);
  } else {
    ui.updateStatus('road-unmatched');
    ui.updateSpeedLimit(null, false);
  }
}

function onOverpassStatus(status: AppStatus | null): void {
  if (status) {
    ui.updateStatus(status);
  }
}

async function onWakeLockRestore(): Promise<void> {
  if (isDriving) {
    await requestWakeLock();
  }
}

function updateDrivingStateFromCached(position: GpsPosition): void {
  if (!cachedRoad) return;

  const drivingState = evaluateDrivingState(
    position,
    currentDisplaySpeed,
    cachedRoad.road,
    currentDisplaySpeed
  );

  ui.updateSpeedLimit(drivingState.speedLimitKmh, drivingState.limitAvailable);
  ui.updateDrivingState(drivingState);
  ui.updateRoadName(drivingState.roadName);
}

function updateDrivingState(position: GpsPosition, road: RoadSegment): void {
  const drivingState = evaluateDrivingState(
    position,
    currentDisplaySpeed,
    road,
    currentDisplaySpeed
  );

  ui.updateSpeedLimit(drivingState.speedLimitKmh, drivingState.limitAvailable);
  ui.updateDrivingState(drivingState);
  ui.updateRoadName(drivingState.roadName);
}

function findRoadFromCache(cached: { speedLimit: number | null; roadName: string | null; highway: string }): RoadSegment | null {
  return {
    id: `cached-${cached.roadName || 'unknown'}`,
    name: cached.roadName,
    maxspeed: cached.speedLimit,
    oneway: false,
    ref: null,
    distance: 0,
    confidence: 0.9,
    highway: cached.highway,
  };
}

init();
