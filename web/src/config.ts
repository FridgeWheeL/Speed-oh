export const CONFIG = {
  gps: {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000,
  } as const,

  speedFilter: {
    emaAlpha: 0.35,
    maxValidSpeedKmh: 250,
    minSpeedKmh: 0,
  } as const,

  roadMatch: {
    maxDistanceMeters: 25,
    headingToleranceDegrees: 135,
    minConfidence: 0.4,
    queryRadius: 30,
    minTimeBetweenQueriesMs: 5000,
  } as const,

  drivingState: {
    approachingThreshold: 3,
    atThreshold: 2,
    hysteresis: 1,
  } as const,

  overpass: {
    baseUrl: 'https://overpass-api.de/api/interpreter',
  } as const,

  cache: {
    maxAgeSeconds: 1800,
    dbName: 'speed-oh-cache',
    storeName: 'roads',
  } as const,

  visual: {
    normalColor: '#1a1a1a',
    approachingColor: '#d97706',
    atColor: '#ea580c',
    aboveColor: '#dc2626',
    approachingBg: '#fffbeb',
    atBg: '#fff7ed',
    aboveBg: '#fef2f2',
    normalBg: '#ffffff',
  } as const,
} as const;
