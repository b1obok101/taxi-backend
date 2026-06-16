export interface GeoPoint {
  lat: number;
  lon: number;
  label: string;
  kind?: string;
}

export interface RouteResult {
  distanceKm: number;
  durationSec: number;
  /** Leaflet polyline coordinates [lat, lon][] */
  coordinates: [number, number][];
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  importance?: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

const PLACE_KIND: Record<string, string> = {
  city: "город",
  town: "город",
  village: "населённый пункт",
  administrative: "регион",
  suburb: "район",
  hamlet: "посёлок",
};

function placeKind(item: NominatimResult): string | undefined {
  if (item.type && PLACE_KIND[item.type]) {
    return PLACE_KIND[item.type];
  }
  if (item.address?.city || item.address?.town) {
    return "город";
  }
  return undefined;
}

function relevanceScore(item: NominatimResult, query: string): number {
  const q = query.toLowerCase();
  const title = item.display_name.split(",")[0]?.trim().toLowerCase() ?? "";
  let score = item.importance ?? 0;

  if (title === q) score += 20;
  else if (title.startsWith(q)) score += 12;
  else if (title.includes(q)) score += 4;

  if (item.type === "city" || item.type === "administrative") score += 6;
  if (item.address?.city || item.address?.town) score += 4;

  return score;
}

const NOMINATIM = import.meta.env.DEV
  ? "/geo/nominatim"
  : "https://nominatim.openstreetmap.org";
const OSRM = import.meta.env.DEV
  ? "/geo/osrm"
  : "https://router.project-osrm.org";

async function nominatimFetch(path: string): Promise<NominatimResult[]> {
  const response = await fetch(`${NOMINATIM}${path}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "ru",
    },
  });
  if (!response.ok) {
    throw new Error("Не удалось найти адрес");
  }
  return response.json();
}

export async function searchAddresses(query: string): Promise<GeoPoint[]> {
  const q = query.trim();
  if (q.length < 2) {
    return [];
  }

  const results = await nominatimFetch(
    `/search?q=${encodeURIComponent(q)}&format=json&limit=10&addressdetails=1&countrycodes=ru,ua,by,kz,md`,
  );

  return results
    .sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q))
    .slice(0, 6)
    .map((item) => ({
      lat: Number(item.lat),
      lon: Number(item.lon),
      label: item.display_name,
      kind: placeKind(item),
    }));
}

export async function geocodeAddress(query: string): Promise<GeoPoint> {
  const q = query.trim();
  if (!q) {
    throw new Error("Пустой адрес");
  }

  const results = await nominatimFetch(
    `/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=0`,
  );

  const item = results[0];
  if (!item) {
    throw new Error(`Адрес не найден: ${q}`);
  }

  return {
    lat: Number(item.lat),
    lon: Number(item.lon),
    label: item.display_name,
    kind: placeKind(item),
  };
}

export async function buildRoute(from: GeoPoint, to: GeoPoint): Promise<RouteResult> {
  const url =
    `${OSRM}/route/v1/driving/` +
    `${from.lon},${from.lat};${to.lon},${to.lat}` +
    "?overview=full&geometries=geojson&steps=false";

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error("Маршрут не построен");
  }

  const data = await response.json();
  const route = data.routes?.[0];
  if (!route?.geometry?.coordinates?.length) {
    throw new Error("Маршрут не найден");
  }

  const coordinates: [number, number][] = route.geometry.coordinates.map(
    ([lon, lat]: [number, number]) => [lat, lon],
  );

  return {
    distanceKm: route.distance / 1000,
    durationSec: route.duration,
    coordinates,
  };
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.ceil(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  }
  return `${minutes} мин`;
}
