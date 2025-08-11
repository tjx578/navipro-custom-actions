import { parseNarasi } from './parser.js';

/**
 * Ambil semua lokasi dari DB di Replit
 */
async function fetchLokasiDB(replitBaseUrl) {
  const res = await fetch(`${replitBaseUrl}/places`);
  if (!res.ok) {
    throw new Error(`Gagal mengambil lokasi DB: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Kirim request rute ke backend Replit
 */
async function fetchRoute(replitBaseUrl, originId, destinationId, waypoints) {
  const res = await fetch(`${replitBaseUrl}/get-route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originId, destinationId, waypoints })
  });
  if (!res.ok) {
    throw new Error(`Gagal membuat rute: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Handler utama Custom Actions GPT
 */
export default async function handler(input) {
  try {
    const { narasi } = input; // Narasi rally dari user
    const REPLIT_BASE_URL = "https://<replit-project>.replit.app"; // Ganti dengan URL Replit Anda

    // 1. Ambil data lokasi terkini dari Replit
    const lokasiDB = await fetchLokasiDB(REPLIT_BASE_URL);

    // 2. Parsing narasi dengan parser pintar
    const steps = parseNarasi(narasi, lokasiDB);

    // 3. Tentukan origin & destination
    const origin = steps.find(s => s.placeId)?.placeId;
    const destination = [...steps].reverse().find(s => s.placeId)?.placeId;

    if (!origin || !destination) {
      return {
        error: "Origin atau destination tidak ditemukan di DB lokasi",
        parsedSteps: steps
      };
    }

    // 4. Tentukan waypoints
    const waypoints = steps
      .filter(s => s.placeId && s.placeId !== origin && s.placeId !== destination)
      .map(s => ({
        placeId: s.placeId,
        coordinate: s.coordinate
      }));

    // 5. Kirim request rute ke backend Replit
    const routeRes = await fetchRoute(REPLIT_BASE_URL, origin, destination, waypoints);

    // 6. Return hasil ke GPT
    return {
      parsedSteps: steps,
      route: routeRes
    };

  } catch (err) {
    return { error: err.message };
  }
}
