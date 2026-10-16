import type { CacheEntry, RoadSegment } from '../types.js';
import { CONFIG } from '../config.js';

let db: IDBDatabase | null = null;

export async function initCache(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CONFIG.cache.dbName, 1);

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(CONFIG.cache.storeName)) {
        database.createObjectStore(CONFIG.cache.storeName, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to open cache database'));
    };
  });
}

async function getStore(): Promise<IDBObjectStore> {
  if (!db) {
    throw new Error('Cache not initialized');
  }
  return db.transaction(CONFIG.cache.storeName, 'readonly').objectStore(CONFIG.cache.storeName);
}

export async function getCachedRoad(
  lat: number,
  lng: number
): Promise<CacheEntry | null> {
  try {
    const store = await getStore();
    const key = roadKey(lat, lng);
    const request = store.get(key) as IDBRequest<CacheEntry>;

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const entry = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        const ageMs = Date.now() - entry.matchedAt;
        if (ageMs > CONFIG.cache.maxAgeSeconds * 1000) {
          resolve(null);
          return;
        }

        resolve(entry);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedRoad(
  lat: number,
  lng: number,
  road: RoadSegment
): Promise<void> {
  try {
    const store = await getStore();
    const entry: CacheEntry & { key: string } = {
      key: roadKey(lat, lng),
      speedLimit: road.maxspeed,
      roadName: road.name,
      highway: road.highway,
      matchedAt: Date.now(),
    };
    store.put(entry);
  } catch {
    console.warn('Failed to cache road data');
  }
}

export async function clearCache(): Promise<void> {
  try {
    if (db) {
      db.close();
      db = null;
    }
  } catch {
    // Ignore cleanup errors
  }
}

function roadKey(lat: number, lng: number): string {
  const roundedLat = Math.round(lat * 1000);
  const roundedLng = Math.round(lng * 1000);
  return `${roundedLat},${roundedLng}`;
}
