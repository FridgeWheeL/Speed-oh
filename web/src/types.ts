export interface GpsPosition {
  latitude: number;
  longitude: number;
  speed: number | null;
  accuracy: number | null;
  timestamp: number;
  heading: number | null;
}

export interface RoadSegment {
  id: string;
  name: string | null;
  maxspeed: number | null;
  oneway: boolean;
  ref: string | null;
  distance: number;
  confidence: number;
  highway: string;
}

export type DrivingStateType =
  | 'none'
  | 'below'
  | 'approaching'
  | 'at'
  | 'above'
  | 'unknown_limit'
  | 'no_gps';

export interface DrivingState {
  type: DrivingStateType;
  currentSpeedKmh: number | null;
  speedLimitKmh: number | null;
  limitAvailable: boolean;
  roadName: string | null;
}

export type AppStatus =
  | 'idle'
  | 'gps-requesting'
  | 'gps-denied'
  | 'gps-unavailable'
  | 'gps-poor-accuracy'
  | 'network-offline'
  | 'road-unmatched'
  | 'speed-limit-unavailable'
  | 'service-unavailable';

export interface CacheEntry {
  speedLimit: number | null;
  roadName: string | null;
  highway: string;
  matchedAt: number;
}
