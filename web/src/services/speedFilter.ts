import { isValidSpeed } from '../utils/conversions.js';
import { CONFIG } from '../config.js';

export class SpeedFilter {
  private smoothedSpeed: number | null = null;
  private initialized = false;

  update(rawSpeedMs: number | null): number | null {
    const isValid = isValidSpeed(rawSpeedMs);

    if (rawSpeedMs !== null && !isValid) {
      return this.smoothedSpeed;
    }

    if (rawSpeedMs === null) {
      return this.smoothedSpeed;
    }

    const speedKmh = rawSpeedMs * 3.6;

    if (speedKmh > CONFIG.speedFilter.maxValidSpeedKmh || speedKmh < CONFIG.speedFilter.minSpeedKmh) {
      return this.smoothedSpeed;
    }

    if (!this.initialized) {
      this.smoothedSpeed = speedKmh;
      this.initialized = true;
      return this.smoothedSpeed;
    }

    this.smoothedSpeed =
      CONFIG.speedFilter.emaAlpha * speedKmh +
      (1 - CONFIG.speedFilter.emaAlpha) * this.smoothedSpeed!;

    return Math.round(this.smoothedSpeed * 10) / 10;
  }

  reset(): void {
    this.smoothedSpeed = null;
    this.initialized = false;
  }
}
