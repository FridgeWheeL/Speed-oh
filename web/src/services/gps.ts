import { GpsPosition, AppStatus } from '../types.js';
import { CONFIG } from '../config.js';

type PositionHandler = (position: GpsPosition | null, status?: AppStatus) => void;

export class GpsService {
  private watchId: number | null = null;
  private onPosition: PositionHandler;

  constructor(onPosition: PositionHandler) {
    this.onPosition = onPosition;
  }

  start(): void {
    if (!('geolocation' in navigator)) {
      this.onPosition(null, 'gps-unavailable');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (raw) => {
        const position: GpsPosition = {
          latitude: raw.coords.latitude,
          longitude: raw.coords.longitude,
          speed: raw.coords.speed !== null ? raw.coords.speed : null,
          accuracy: raw.coords.accuracy,
          timestamp: raw.timestamp,
          heading: raw.coords.heading !== null ? raw.coords.heading : null,
        };

        if (raw.coords.accuracy && raw.coords.accuracy > 50) {
          this.onPosition(position, 'gps-poor-accuracy');
        } else {
          this.onPosition(position);
        }
      },
      () => {
        this.onPosition(null, 'gps-denied');
      },
      {
        enableHighAccuracy: CONFIG.gps.enableHighAccuracy,
        maximumAge: CONFIG.gps.maximumAge,
        timeout: CONFIG.gps.timeout,
      }
    );
  }

  stop(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  get isTracking(): boolean {
    return this.watchId !== null;
  }
}
