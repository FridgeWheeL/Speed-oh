import type { DrivingState, AppStatus } from '../types.js';
import { CONFIG } from '../config.js';

const app = document.getElementById('app')!;
const splash = document.getElementById('splash')!;
const drivingScreen = document.getElementById('driving-screen')!;
const toggleBtn = document.getElementById('toggle-btn') as HTMLButtonElement;
const currentSpeedEl = document.getElementById('current-speed')!;
const speedLimitEl = document.getElementById('speed-limit')!;
const stateIndicator = document.getElementById('state-indicator')!;
const statusEl = document.getElementById('status')!;
const roadNameEl = document.getElementById('road-name')!;

export enum ScreenState {
  SPLASH = 'splash',
  DRIVING = 'driving',
}

let currentState = ScreenState.SPLASH;

export function showSplash(): void {
  if (currentState === ScreenState.SPLASH) return;
  currentState = ScreenState.SPLASH;
  splash.classList.remove('hidden');
  drivingScreen.classList.add('hidden');
  resetDisplay();
}

export function showDriving(): void {
  if (currentState === ScreenState.DRIVING) return;
  currentState = ScreenState.DRIVING;
  splash.classList.add('hidden');
  drivingScreen.classList.remove('hidden');
  resetDisplay();
}

export function updateSpeed(speedKmh: number | null): void {
  currentSpeedEl.textContent = speedKmh !== null ? speedKmh.toString() : '--';
}

export function updateSpeedLimit(limit: number | null, limitAvailable: boolean): void {
  if (!limitAvailable || limit === null) {
    speedLimitEl.textContent = '--';
    speedLimitEl.style.color = '#9ca3af';
  } else {
    speedLimitEl.textContent = limit.toString();
    speedLimitEl.style.color = '';
  }
}

export function updateDrivingState(state: DrivingState): void {
  const { type, currentSpeedKmh, speedLimitKmh, limitAvailable } = state;

  stateIndicator.className = 'state-indicator';

  let bgColor: string;
  let speedColor: string;

  switch (type) {
    case 'below':
      bgColor = CONFIG.visual.normalBg;
      speedColor = CONFIG.visual.normalColor;
      stateIndicator.classList.add('state-below');
      break;
    case 'approaching':
      bgColor = CONFIG.visual.approachingBg;
      speedColor = CONFIG.visual.approachingColor;
      stateIndicator.classList.add('state-approaching');
      break;
    case 'at':
      bgColor = CONFIG.visual.atBg;
      speedColor = CONFIG.visual.atColor;
      stateIndicator.classList.add('state-at');
      break;
    case 'above':
      bgColor = CONFIG.visual.aboveBg;
      speedColor = CONFIG.visual.aboveColor;
      stateIndicator.classList.add('state-above');
      break;
    case 'unknown_limit':
      bgColor = CONFIG.visual.normalBg;
      speedColor = '#9ca3af';
      stateIndicator.classList.add('state-unavailable');
      break;
    case 'no_gps':
      bgColor = CONFIG.visual.normalBg;
      speedColor = '#9ca3af';
      stateIndicator.classList.add('state-no-gps');
      break;
    default:
      bgColor = CONFIG.visual.normalBg;
      speedColor = CONFIG.visual.normalColor;
  }

  app.style.backgroundColor = bgColor;
  currentSpeedEl.style.color = speedColor;
}

export function updateStatus(status: AppStatus | null): void {
  if (!status) {
    statusEl.textContent = '';
    return;
  }

  const messages: Record<AppStatus, string> = {
    'idle': '',
    'gps-requesting': 'Requesting location...',
    'gps-denied': 'Location access denied. Please enable in browser settings.',
    'gps-unavailable': 'GPS not available on this device.',
    'gps-poor-accuracy': 'GPS accuracy is low. Moving to get better signal.',
    'network-offline': 'Network unavailable. Using cached data.',
    'road-unmatched': 'Road not identified.',
    'speed-limit-unavailable': 'Speed limit not available for this road.',
    'service-unavailable': 'Speed limit service unavailable.',
  };

  statusEl.textContent = messages[status] || '';
}

export function updateRoadName(name: string | null): void {
  roadNameEl.textContent = name || '';
}

export function setToggleText(text: string): void {
  toggleBtn.textContent = text;
}

export function onToggleClick(handler: () => void): void {
  toggleBtn.addEventListener('click', handler);
}

function resetDisplay(): void {
  currentSpeedEl.textContent = '--';
  speedLimitEl.textContent = '--';
  app.style.backgroundColor = '';
  currentSpeedEl.style.color = '';
  speedLimitEl.style.color = '';
  stateIndicator.className = 'state-indicator';
  statusEl.textContent = '';
  roadNameEl.textContent = '';
}
