let wakeLock: WakeLockSentinel | null = null;
let isActive = false;

export async function requestWakeLock(): Promise<void> {
  if (!('wakeLock' in navigator)) return;

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    isActive = true;

    wakeLock.addEventListener('release', () => {
      isActive = false;
    });
  } catch (err) {
    console.warn('Wake Lock request failed:', err);
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
    isActive = false;
  }
}

export function isWakeLockActive(): boolean {
  return isActive;
}

export function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator;
}

export function setupWakeLockVisibilityListener(onVisible: () => void): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !isActive) {
      onVisible();
    }
  });
}
