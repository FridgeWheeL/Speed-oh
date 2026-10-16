import { CONFIG } from '../config.js';
import type { RoadSegment, AppStatus } from '../types.js';
import { parseMaxspeed } from './speedLimit.js';

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  nodes?: number[];
  tags?: {
    highway?: string;
    maxspeed?: string;
    name?: string;
    oneway?: string;
    ref?: string;
    ['maxspeed:conditional']?: string;
  };
}

interface OverpassResponse {
  version: string;
  elements: OverpassElement[];
}

const UNWANTED_ROAD_TYPES = new Set([
  'footway',
  'cycleway',
  'steps',
  'path',
  'pedestrian',
  'platform',
  'corridor',
]);

export async function queryRoads(
  lat: number,
  lng: number,
  statusUpdate?: (status: AppStatus | null) => void
): Promise<RoadSegment[]> {
  const query = `[out:json][timeout:10];
way["highway"](around:${CONFIG.roadMatch.queryRadius},${lat},${lng});
out body ${CONFIG.roadMatch.queryRadius * 2};
>;
out skel qt;`;

  const url = `${CONFIG.overpass.baseUrl}?data=${encodeURIComponent(query)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    statusUpdate?.('network-offline');

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status >= 500) {
        statusUpdate?.('service-unavailable');
      }
      return [];
    }

    const data: OverpassResponse = await response.json();
    statusUpdate?.(null);

    return processRoadData(data, lat, lng);
  } catch (error) {
    statusUpdate?.('network-offline');
    return [];
  }
}

function processRoadData(data: OverpassResponse, lat: number, lng: number): RoadSegment[] {
  const nodes: Record<number, { lat: number; lon: number }> = {};
  for (const el of data.elements) {
    if (el.type === 'node' && el.lat !== undefined && el.lon !== undefined) {
      nodes[el.id] = { lat: el.lat, lon: el.lon };
    }
  }

  const roads: RoadSegment[] = [];
  const seenWays = new Set<number>();

  for (const el of data.elements) {
    if (el.type !== 'way' || !el.tags?.highway) continue;
    if (UNWANTED_ROAD_TYPES.has(el.tags.highway)) continue;
    if (seenWays.has(el.id)) continue;
    if (!el.nodes || el.nodes.length < 2) continue;

    seenWays.add(el.id);

    const coords: { lat: number; lon: number }[] = [];
    for (const nodeId of el.nodes) {
      if (nodes[nodeId]) coords.push(nodes[nodeId]);
    }

    if (coords.length < 2) continue;

    const distance = minDistanceToWay(coords, lat, lng);
    if (distance > CONFIG.roadMatch.maxDistanceMeters) continue;

    let maxspeed: number | null = null;
    if (el.tags.maxspeed) {
      maxspeed = parseMaxspeed(el.tags.maxspeed);
    }

    const roadName = el.tags.name ?? el.tags.ref ?? null;

    roads.push({
      id: `way-${el.id}`,
      name: roadName,
      maxspeed,
      oneway: el.tags.oneway === 'yes',
      ref: el.tags.ref ?? null,
      distance,
      confidence: 1 - distance / CONFIG.roadMatch.maxDistanceMeters,
      highway: el.tags.highway,
    });
  }

  roads.sort((a, b) => b.confidence - a.confidence);
  return roads.slice(0, 5);
}

function minDistanceToWay(
  coords: { lat: number; lon: number }[],
  lat: number,
  lng: number
): number {
  let minDist = Infinity;

  for (let i = 0; i < coords.length - 1; i++) {
    const dist = pointToSegmentDistance(
      coords[i].lat, coords[i].lon,
      coords[i + 1].lat, coords[i + 1].lon,
      lat, lng
    );
    minDist = Math.min(minDist, dist);
  }

  return minDist;
}

function pointToSegmentDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  lat: number,
  lng: number
): number {
  const dx = lon2 - lon1;
  const dy = lat2 - lat1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return haversineDistance(lat1, lon1, lat, lng);
  }

  let t = ((lat - lat1) * dy + (lng - lon1) * dx) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projLat = lat1 + t * dy;
  const projLon = lon1 + t * dx;

  return haversineDistance(projLat, projLon, lat, lng);
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
