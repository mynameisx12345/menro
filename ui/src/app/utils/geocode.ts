import { environment } from '../../environments/environment';

const BASE = `${environment.apiUrl}/geocode`;

export async function geoSearch(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    return data.length ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
  } catch {
    return null;
  }
}

export async function geoReverse(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/reverse?lat=${lat}&lon=${lon}`, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

export async function geoReverseRaw(lat: number, lon: number): Promise<any> {
  try {
    const res = await fetch(`${BASE}/reverse?lat=${lat}&lon=${lon}`, { signal: AbortSignal.timeout(6000) });
    return await res.json();
  } catch {
    return null;
  }
}
